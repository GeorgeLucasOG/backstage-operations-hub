-- Renomear tabelas existentes para seguir o padrão CamelCase
ALTER TABLE IF EXISTS "users" RENAME TO "User";
ALTER TABLE IF EXISTS "user_restaurant" RENAME TO "UserRestaurant";

-- Opção 1: Renomear coluna password_hash para password (RECOMENDADO)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'password_hash'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'password'
    ) THEN
        ALTER TABLE "User" RENAME COLUMN password_hash TO password;
        RAISE NOTICE 'Coluna password_hash renomeada para password';
    END IF;
END $$;

-- Opção 2: Se prefere manter password_hash, adicionar password como alias (ALTERNATIVA)
-- Remova os comentários abaixo se preferir esta opção 
/*
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'password_hash'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'password'
    ) THEN
        -- Verificar versão do PostgreSQL para utilizar a sintaxe correta
        ALTER TABLE "User" ADD COLUMN password TEXT;
        -- Criar trigger para manter password e password_hash sincronizados
        CREATE OR REPLACE FUNCTION sync_password()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' OR NEW.password IS NOT NULL THEN
                NEW.password_hash := NEW.password;
            ELSIF NEW.password_hash IS NOT NULL THEN
                NEW.password := NEW.password_hash;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS sync_password_trigger ON "User";
        CREATE TRIGGER sync_password_trigger
        BEFORE INSERT OR UPDATE ON "User"
        FOR EACH ROW
        EXECUTE FUNCTION sync_password();
        
        -- Inicializar password com os valores existentes em password_hash
        UPDATE "User" SET password = password_hash;
        
        RAISE NOTICE 'Adicionada coluna password como alias para password_hash';
    END IF;
END $$;
*/

-- Caso as tabelas ainda não existam, criar com o padrão correto
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'pdv', 'monitor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de relação entre usuários e restaurantes
CREATE TABLE IF NOT EXISTS "UserRestaurant" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Criar função para listar as colunas de uma tabela (útil para diagnóstico)
CREATE OR REPLACE FUNCTION list_columns(table_name TEXT)
RETURNS TABLE(column_name TEXT, data_type TEXT, is_nullable BOOLEAN) AS $$
BEGIN
    RETURN QUERY 
    SELECT c.column_name::TEXT, c.data_type::TEXT, 
           CASE WHEN c.is_nullable = 'YES' THEN TRUE ELSE FALSE END
    FROM information_schema.columns c
    WHERE c.table_name = table_name
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Forçar atualização do cache de esquema do PostgREST
NOTIFY pgrst, 'reload schema';

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_restaurant_user_id ON "UserRestaurant"(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restaurant_restaurant_id ON "UserRestaurant"(restaurant_id);

-- Adicionar comentários para melhor documentação
COMMENT ON TABLE "User" IS 'Tabela de usuários do sistema';
COMMENT ON TABLE "UserRestaurant" IS 'Tabela de relação entre usuários e restaurantes';

-- Configurar permissões RLS (Row Level Security)
-- Desativar RLS para "User"
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Desativar RLS para "UserRestaurant" 
ALTER TABLE "UserRestaurant" DISABLE ROW LEVEL SECURITY;

-- Garantir que o anon role (usado pelo cliente Supabase) tem permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON "User" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "UserRestaurant" TO anon;
GRANT EXECUTE ON FUNCTION list_columns TO anon;

-- Forçar atualização novamente do cache de esquema após todas as alterações
NOTIFY pgrst, 'reload schema';

-- Inserir usuários administradores padrão (opcional - se você quiser que eles existam no banco)
-- Descomente estas linhas se desejar incluir estes usuários no banco
-- INSERT INTO "User" (id, name, email, password, role)
-- VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@example.com', 'admin123', 'admin'),
-- ('00000000-0000-0000-0000-000000000002', 'Admin', 'admin@admin.com', 'admin', 'admin')
-- ON CONFLICT (email) DO NOTHING; 