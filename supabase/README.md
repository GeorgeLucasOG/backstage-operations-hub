# Tabelas do Supabase

Este diretório contém arquivos para a configuração do banco de dados do Supabase.

## Tabelas de Usuários

O sistema utiliza o Supabase para armazenar dados de usuários e suas associações com restaurantes.

### Tabelas Criadas:

1. **User** - Armazena informações dos usuários:

   - `id`: UUID (chave primária)
   - `name`: Nome do usuário
   - `email`: Email (único)
   - `password`: Senha (em produção deveria ser hash)
   - `role`: Perfil do usuário (admin, manager, pdv, monitor)
   - `created_at`: Data de criação
   - `updated_at`: Data de atualização

2. **UserRestaurant** - Associa usuários aos restaurantes:
   - `id`: UUID (chave primária)
   - `user_id`: ID do usuário (referência à tabela User)
   - `restaurant_id`: ID do restaurante (referência à tabela Restaurant)
   - `created_at`: Data de criação
   - `updated_at`: Data de atualização

> **Nota importante:** Se você tinha tabelas chamadas "users" e "user_restaurant", elas serão renomeadas para "User" e "UserRestaurant" respectivamente para manter a consistência com o padrão de nomenclatura CamelCase usado no resto do banco de dados.

## Como Configurar o Banco de Dados

### Método 1: Utilizando o Console SQL do Supabase

1. Acesse o [Console do Supabase](https://app.supabase.com/) e faça login
2. Selecione seu projeto (ID: rnyjdamaqjxplmpskdry)
3. Navegue até "Table Editor" > "SQL Editor"
4. Crie uma nova consulta
5. Copie e cole o conteúdo do arquivo `sql/create_user_tables.sql`
6. Clique em "Run" para executar o script SQL

Este é o método mais simples e rápido, recomendado se você está tendo problemas com a CLI.

### Método 2: Utilizando a CLI do Supabase

1. Certifique-se de que o Supabase CLI está instalado:

   ```bash
   npm install -g supabase
   ```

2. Configure seu projeto Supabase:

   ```bash
   supabase login
   supabase link --project-ref rnyjdamaqjxplmpskdry
   ```

3. Aplique a migração:
   ```bash
   supabase db push
   ```

### Método Rápido para Corrigir o Problema da Coluna password_hash

Se você está recebendo o erro "Could not find the 'password' column", execute diretamente este SQL:

```sql
-- Renomear a coluna password_hash para password
ALTER TABLE "User" RENAME COLUMN password_hash TO password;

-- Forçar atualização do cache de esquema
NOTIFY pgrst, 'reload schema';
```

## Verificação

Para verificar se as tabelas foram criadas corretamente via Console SQL:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Para verificar as permissões configuradas:

```sql
-- Verificar RLS (Row Level Security)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('User', 'UserRestaurant');

-- Verificar permissões de roles
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('User', 'UserRestaurant')
  AND table_schema = 'public';
```

Para verificar a estrutura das colunas:

```sql
-- Verificar colunas da tabela User
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;
```

## Solucionando Problemas

Se você estiver recebendo erros ao registrar usuários, verifique o console do navegador para ver mensagens de erro detalhadas. Problemas comuns incluem:

1. **Tabelas não existem**: Execute o script SQL mencionado acima
2. **Violação de chave única**: Email já registrado
3. **Violação de chave estrangeira**: Restaurante não existe
4. **Violação de constraint**: Valor inválido para o campo role
5. **Erro após renomeação**: Se encontrar erros relacionados a permissões após renomear as tabelas, você pode precisar reajustar as permissões Row Level Security (RLS) no console do Supabase

### Erro: "Could not find the 'password' column"

Se você receber um erro como "Could not find the 'password' column of 'User' in the schema cache" (Código: PGRST204), isso ocorre porque a tabela foi renomeada, mas a coluna de senha ainda se chama `password_hash` em vez de `password`.

Para corrigir este problema específico:

1. Execute o script SQL completo que já inclui a correção da coluna
2. Ou execute apenas este comando específico para renomear a coluna:

```sql
-- Renomear a coluna password_hash para password
ALTER TABLE "User" RENAME COLUMN password_hash TO password;

-- Forçar atualização do cache de esquema
NOTIFY pgrst, 'reload schema';
```

> **Nota importante:** Este erro ocorre porque o código da aplicação está tentando acessar uma coluna chamada `password`, mas a tabela tem uma coluna `password_hash`. O script SQL irá renomear a coluna para manter compatibilidade sem precisar alterar o código.

### Erros de Permissão

Se estiver enfrentando erros de permissão (códigos 42501 ou 42P10), execute o seguinte SQL para corrigir:

```sql
-- Desativar RLS para as tabelas
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "UserRestaurant" DISABLE ROW LEVEL SECURITY;

-- Conceder permissões ao role 'anon' (utilizado pelo cliente Supabase)
GRANT SELECT, INSERT, UPDATE, DELETE ON "User" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "UserRestaurant" TO anon;
```

## Acesso Programático

Você pode acessar as tabelas através do cliente Supabase:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Exemplo: buscar todos os usuários
const { data, error } = await supabase.from("User").select("*");
```
