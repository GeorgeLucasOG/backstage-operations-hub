-- Script para adicionar a coluna 'role' diretamente na tabela User
-- Abordagem mais simples que mantém compatibilidade com o código existente

-- Verificar primeiro se a tabela existe com o nome correto
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'User'
    ) INTO table_exists;

    IF NOT table_exists THEN
        SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'user'
        ) INTO table_exists;

        IF table_exists THEN
            RAISE NOTICE 'A tabela existe com o nome "user" (minúsculo). Considere renomear para "User" ou ajustar o código.';
        ELSE
            RAISE EXCEPTION 'A tabela de usuários não foi encontrada. Verifique o nome exato no banco de dados.';
        END IF;
    END IF;
END $$;

-- 1. Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'role'
    ) THEN
        -- Adicionar a coluna role
        ALTER TABLE "User" ADD COLUMN role TEXT GENERATED ALWAYS AS (
            (SELECT name FROM roles WHERE id = role_id)
        ) STORED;
        
        RAISE NOTICE 'Coluna role adicionada como coluna virtual baseada em role_id';
    END IF;
END $$;

-- 2. Verificar se já existem todos os perfis necessários
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

-- 3. Adicionar função para ser usada no trigger de inserção/atualização
CREATE OR REPLACE FUNCTION set_role_id_from_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o novo valor de role é fornecido, buscar o role_id correspondente
    IF NEW.role IS NOT NULL AND (NEW.role_id IS NULL OR TG_OP = 'UPDATE') THEN
        SELECT id INTO NEW.role_id FROM roles WHERE name = NEW.role;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Perfil "%" não encontrado na tabela roles', NEW.role;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Adicionar trigger para atualizar role_id automaticamente quando role for fornecido
DROP TRIGGER IF EXISTS user_role_trigger ON "User";
CREATE TRIGGER user_role_trigger
BEFORE INSERT OR UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION set_role_id_from_role();

-- 5. Forçar atualização do cache de esquema
NOTIFY pgrst, 'reload schema'; 