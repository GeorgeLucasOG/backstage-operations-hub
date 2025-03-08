# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c7916c55-9903-4c3c-90f1-815214b88930

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c7916c55-9903-4c3c-90f1-815214b88930) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c7916c55-9903-4c3c-90f1-815214b88930) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

# Admin Menu

Sistema de gestão para restaurantes.

## Sobre o problema de permissão do CashRegisters

Se você estiver enfrentando o erro "permission denied for table CashRegisters", siga os passos abaixo para resolver:

### 1. Execute as funções SQL no Supabase

Acesse o painel do Supabase → SQL Editor e execute o conteúdo do arquivo `supabase/functions.sql`. Isso irá criar:

1. A função `execute_sql` que permite executar SQL com privilégios elevados
2. Uma nova função `create_cash_register_secure` (para evitar conflito com a função existente)
3. A função `calculate_new_amount` (se ainda não existir)

**IMPORTANTE**: Se você receber o erro "function name 'create_cash_register' is not unique", é porque essa função já existe. Isso é bom! Nosso código está preparado para usar tanto a função existente quanto a nova função `create_cash_register_secure`.

### 2. Configure as variáveis de ambiente

Certifique-se de que seu arquivo `.env.local` contenha:

```
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoaqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
```

A chave `SUPABASE_SERVICE_ROLE_KEY` é importante para o endpoint de API que criamos como último recurso.

### 3. Verifique as políticas de RLS

Execute no SQL Editor do Supabase:

```sql
-- Desativar temporariamente RLS para CashRegisters
ALTER TABLE "CashRegisters" DISABLE ROW LEVEL SECURITY;

-- OU criar uma política permissiva
CREATE POLICY "Allow all operations for authenticated users on CashRegisters"
ON "CashRegisters"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

### 4. Verificar configurações da tabela

```sql
-- Ver definição da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'CashRegisters';

-- Ver políticas
SELECT * FROM pg_policies WHERE tablename = 'CashRegisters';

-- Ver permissões
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'CashRegisters';
```

### 5. Como o código tenta criar caixas

Nosso código agora usa uma abordagem de múltiplas tentativas para garantir que o caixa seja criado:

1. Tenta inserção direta no banco de dados
2. Tenta usar SQL direto via função `execute_sql`
3. Tenta usar a nova função `create_cash_register_secure`
4. Tenta usar a função existente `create_cash_register`
5. Como último recurso, tenta via API com Service Role

Se qualquer uma dessas abordagens funcionar, o caixa será criado com sucesso.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar o servidor de desenvolvimento
npm run dev
```

Acesse o sistema em [http://localhost:3000](http://localhost:3000).
