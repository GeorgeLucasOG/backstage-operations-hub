-- Script para modificar a tabela User e adicionar a coluna 'role'
-- Este script adiciona uma nova coluna virtual 'role' que busca o nome do perfil da tabela roles

-- 1. Primeiramente, verifique se existem todos os perfis necessários na tabela 'roles'
DO $$
BEGIN
  -- Verificar e inserir os perfis necessários
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin') THEN
    INSERT INTO roles (name, description) VALUES ('admin', 'Administrador do sistema');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'manager') THEN
    INSERT INTO roles (name, description) VALUES ('manager', 'Gerente de restaurante');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'pdv') THEN
    INSERT INTO roles (name, description) VALUES ('pdv', 'Operador de PDV');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'monitor') THEN
    INSERT INTO roles (name, description) VALUES ('monitor', 'Monitor de pedidos');
  END IF;
END $$;

-- 2. Criar uma função para buscar o nome do perfil pelo role_id
CREATE OR REPLACE FUNCTION get_role_name(role_id uuid)
RETURNS TEXT AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT name INTO role_name FROM roles WHERE id = role_id;
  RETURN role_name;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar uma view que inclui a coluna 'role'
CREATE OR REPLACE VIEW user_with_role AS
SELECT 
  u.*,
  get_role_name(u.role_id) as role
FROM 
  "User" u;

-- 4. Conceder permissões na view
GRANT SELECT, INSERT, UPDATE, DELETE ON user_with_role TO anon;
GRANT EXECUTE ON FUNCTION get_role_name TO anon;

-- 5. Criar um trigger para permitir inserções e atualizações na view
CREATE OR REPLACE FUNCTION user_with_role_trigger()
RETURNS TRIGGER AS $$
DECLARE
  role_id_value uuid;
BEGIN
  -- Se uma inserção/atualização incluir 'role', buscar o role_id correspondente
  IF NEW.role IS NOT NULL THEN
    SELECT id INTO role_id_value FROM roles WHERE name = NEW.role;
    IF role_id_value IS NULL THEN
      RAISE EXCEPTION 'Perfil "%" não encontrado na tabela roles', NEW.role;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
      INSERT INTO "User" (
        id, name, email, password, role_id, created_at, updated_at
      ) VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.name,
        NEW.email,
        NEW.password,
        role_id_value,
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
      );
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      UPDATE "User" SET
        name = NEW.name,
        email = NEW.email,
        password = NEW.password,
        role_id = role_id_value,
        updated_at = NOW()
      WHERE id = NEW.id;
      RETURN NEW;
    END IF;
  END IF;
  
  -- Se não incluir 'role', propagar normalmente
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "User" SELECT * FROM NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE "User" SET
      name = NEW.name,
      email = NEW.email,
      password = NEW.password,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Aplicar o trigger na view
DROP TRIGGER IF EXISTS user_with_role_insert_trigger ON user_with_role;
CREATE TRIGGER user_with_role_insert_trigger
INSTEAD OF INSERT ON user_with_role
FOR EACH ROW
EXECUTE FUNCTION user_with_role_trigger();

DROP TRIGGER IF EXISTS user_with_role_update_trigger ON user_with_role;
CREATE TRIGGER user_with_role_update_trigger
INSTEAD OF UPDATE ON user_with_role
FOR EACH ROW
EXECUTE FUNCTION user_with_role_trigger();

-- 7. Forçar atualização do cache de esquema
NOTIFY pgrst, 'reload schema'; 