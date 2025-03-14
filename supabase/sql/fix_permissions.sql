-- Script para corrigir permissões na tabela roles
-- Erro: permission denied for tables roles

-- 1. Verificar se a tabela roles existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'roles'
    ) THEN
        RAISE EXCEPTION 'A tabela roles não existe!';
    END IF;
END $$;

-- 2. Conceder permissões de leitura à tabela roles para todos os usuários
GRANT SELECT ON TABLE roles TO anon, authenticated, service_role;

-- 3. Se necessário criar política de RLS para a tabela roles
-- Primeiro, habilitar RLS na tabela roles (se ainda não estiver habilitado)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Criar política que permite a leitura de todos os registros na tabela roles
DROP POLICY IF EXISTS "Todos podem ler roles" ON roles;
CREATE POLICY "Todos podem ler roles" 
    ON roles FOR SELECT 
    USING (true);

-- 4. Notificar o Supabase para atualizar o cache de permissões
NOTIFY pgrst, 'reload schema';