-- Solução simples para o erro "Could not find the role column"
-- Este script cria uma VIEW que permite acessar a coluna 'role' sem modificar a tabela original

-- 1. Criar uma view simples que add a coluna 'role'
CREATE OR REPLACE VIEW user_with_role AS
SELECT 
  u.*,
  r.name as role  -- Adiciona a coluna 'role' que vem da tabela roles
FROM 
  "User" u
LEFT JOIN
  roles r ON u.role_id = r.id;

-- 2. Conceder permissões na view
GRANT SELECT, INSERT, UPDATE, DELETE ON user_with_role TO authenticated, anon, service_role;

-- 3. Atualizar o cache do schema
NOTIFY pgrst, 'reload schema'; 