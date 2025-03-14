# Sistema de Administração para Restaurantes

Um sistema administrativo moderno para restaurantes, desenvolvido com React e TypeScript.

## Funcionalidades

- **Dashboard Informativo**: Visão geral do seu restaurante
- **Gerenciamento de Produtos**: Cadastre e gerencie seu cardápio
- **Comandas**: Organize os pedidos dos clientes
- **Usuários**: Gerencie sua equipe de trabalho
- **Interface Responsiva**: Funciona em dispositivos móveis e desktop

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components

## Como Usar

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Execute o projeto com `npm run dev`
4. Acesse o sistema em `http://localhost:3000/admin`

## Estrutura do Projeto

- `src/pages/admin/index.tsx`: Layout administrativo com menu de navegação e dashboard
- `src/components/ui`: Componentes de UI reutilizáveis

## Próximos Passos

- Implementação do sistema de produtos
- Sistema de gerenciamento de comandas
- Relatórios e analytics
- Sistema de usuários e permissões
- Integração com serviços de delivery

## Licença

MIT

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

This project is built with:

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

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar o servidor de desenvolvimento
npm run dev
```

Acesse o sistema em [http://localhost:3000](http://localhost:3000).

## Autenticação de Usuários

O sistema de autenticação utiliza o Supabase como fonte de dados para armazenamento de usuários.

### Estrutura de Tabelas de Usuários

- **User**: Armazena dados básicos dos usuários como nome, email, senha e perfil.
- **UserRestaurant**: Gerencia a relação entre usuários e restaurantes, especialmente para perfis restritos.

### Perfis de Usuário

- **Admin**: Acesso completo ao sistema e a todos os restaurantes.
- **Manager**: Acesso restrito ao restaurante associado, com permissões para gerenciamento.
- **PDV**: Acesso ao ponto de venda de um restaurante específico.
- **Monitor**: Visualização dos dados de um restaurante específico.

### Usuários Administrativos Padrão

Por segurança, o sistema ainda mantém os usuários administrativos padrão:

- Email: admin@example.com / Senha: admin123
- Email: admin@admin.com / Senha: admin

### Sessão de Usuário

Os dados de autenticação (sessão atual) são mantidos no localStorage apenas para fins de estado da aplicação, enquanto todos os dados de usuários são persistidos no banco de dados Supabase.
