-- Script para encontrar todas as tabelas no banco de dados
-- e localizar a tabela de usuários independente do case sensitivity

-- Listar todas as tabelas no schema público
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Procurar tabelas relacionadas a usuários por nome
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename ILIKE '%user%'
ORDER BY tablename;

-- Procurar tabelas relacionadas a perfis/roles
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename ILIKE '%role%'
ORDER BY tablename;

-- Listar todas as views (visões) no schema público
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Verificar schema das tabelas que podem ser relevantes
-- 1. Procurar estrutura de qualquer tabela que tenha 'user' no nome
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name ILIKE '%user%'
ORDER BY table_name, ordinal_position;

-- 2. Procurar estrutura de qualquer tabela que tenha 'role' no nome
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name ILIKE '%role%'
ORDER BY table_name, ordinal_position; 