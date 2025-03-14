-- Script para verificar o esquema das tabelas de usuários
-- Execute este script no Console SQL do Supabase para obter informações sobre as tabelas

-- Verificar se a tabela User existe e suas colunas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- Verificar se a tabela roles existe e suas colunas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'roles' 
ORDER BY ordinal_position;

-- Listar todos os roles cadastrados
SELECT * FROM roles;

-- Verificar se a tabela permissions existe e suas colunas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'permissions' 
ORDER BY ordinal_position;

-- Verificar se a tabela sessions existe e suas colunas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- Verificar as relações entre as tabelas
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND (tc.table_name = 'User' OR ccu.table_name = 'User');

-- Exibir definição de chaves estrangeiras
SELECT conrelid::regclass AS table_from,
       conname,
       pg_get_constraintdef(oid)
FROM   pg_constraint
WHERE  contype = 'f'
AND    (conrelid = '"User"'::regclass OR confrelid = '"User"'::regclass);

-- Verificação alternativa usando o id das tabelas no sistema
SELECT conrelid::regclass AS table_from,
       conname,
       pg_get_constraintdef(oid)
FROM   pg_constraint
WHERE  contype = 'f'
AND    (conrelid IN (SELECT oid FROM pg_class WHERE relname = 'User') 
        OR confrelid IN (SELECT oid FROM pg_class WHERE relname = 'User'));

-- Verificar o nome exato da tabela no banco de dados
SELECT relname
FROM pg_class
WHERE relkind = 'r' -- 'r' significa tabela regular
AND relname ILIKE 'user'; 