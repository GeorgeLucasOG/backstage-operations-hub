-- Script para criar uma view que adiciona a coluna 'role' à tabela User
-- Esta abordagem não altera a estrutura da tabela original

-- 1. Verificar primeiro se a tabela existe com o nome correto
DO $$
DECLARE
    table_exists boolean;
    table_name text;
BEGIN
    -- Verificar se existe com 'User'
    SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'User'
    ) INTO table_exists;

    IF table_exists THEN
        table_name := 'User';
    ELSE
        -- Verificar se existe com 'user'
        SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'user'
        ) INTO table_exists;
        
        IF table_exists THEN
            table_name := 'user';
            RAISE NOTICE 'A tabela existe com o nome "user" (minúsculo)';
        ELSE
            RAISE EXCEPTION 'A tabela de usuários não foi encontrada. Verifique o nome exato no banco de dados.';
        END IF;
    END IF;
    
    RAISE NOTICE 'Usando tabela: %', table_name;
END $$;

-- 2. Verificar se a tabela roles existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'roles'
    ) THEN
        RAISE EXCEPTION 'A tabela "roles" não foi encontrada. Esta tabela é necessária para a solução.';
    END IF;
END $$;

-- 3. Verificar se já existem todos os perfis necessários
DO $$
BEGIN
    -- Verificar e inserir os perfis necessários
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin') THEN
        INSERT INTO roles (id, name, description) 
        VALUES (gen_random_uuid(), 'admin', 'Administrador do sistema');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'manager') THEN
        INSERT INTO roles (id, name, description) 
        VALUES (gen_random_uuid(), 'manager', 'Gerente de restaurante');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'pdv') THEN
        INSERT INTO roles (id, name, description) 
        VALUES (gen_random_uuid(), 'pdv', 'Operador de PDV');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'monitor') THEN
        INSERT INTO roles (id, name, description) 
        VALUES (gen_random_uuid(), 'monitor', 'Monitor de pedidos');
    END IF;
END $$;

-- 4. Criar a função para buscar o nome do role
CREATE OR REPLACE FUNCTION get_role_name(role_id uuid)
RETURNS TEXT AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT name INTO role_name FROM roles WHERE id = role_id;
  RETURN role_name;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar a view que inclui a coluna 'role'
DROP VIEW IF EXISTS user_with_role;
CREATE VIEW user_with_role AS
SELECT 
  u.*,
  get_role_name(u.role_id) as role
FROM 
  "User" u;

-- 6. Criar função para o trigger
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
        updated_at = COALESCE(NEW.updated_at, NOW())
      WHERE id = NEW.id;
      RETURN NEW;
    END IF;
  END IF;
  
  -- Se não incluir 'role', propagar normalmente
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "User" (
      id, name, email, password, role_id, created_at, updated_at
    ) VALUES (
      COALESCE(NEW.id, gen_random_uuid()),
      NEW.name,
      NEW.email,
      NEW.password,
      NEW.role_id,
      COALESCE(NEW.created_at, NOW()),
      COALESCE(NEW.updated_at, NOW())
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE "User" SET
      name = NEW.name,
      email = NEW.email,
      password = NEW.password,
      role_id = NEW.role_id,
      updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Aplicar os triggers na view
CREATE TRIGGER user_with_role_insert_trigger
INSTEAD OF INSERT ON user_with_role
FOR EACH ROW
EXECUTE FUNCTION user_with_role_trigger();

CREATE TRIGGER user_with_role_update_trigger
INSTEAD OF UPDATE ON user_with_role
FOR EACH ROW
EXECUTE FUNCTION user_with_role_trigger();

-- 8. Conceder permissões na view
GRANT SELECT, INSERT, UPDATE, DELETE ON user_with_role TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_role_name TO anon, authenticated, service_role;

-- 9. Forçar atualização do cache de esquema
NOTIFY pgrst, 'reload schema'; 