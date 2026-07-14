Atue como um Desenvolvedor Front-end Next.js Sênior. Forneça a estrutura completa de Server Actions e Schemas de validação com Zod para consumir os endpoints HTTP de gerenciamento de projetos listados abaixo.

### 🌐 Endpoints da API para consumo (Base URL: process.env.API_URL)
- `GET /projects` (Buscar todos os projetos)
- `GET /projects/:id` (Buscar projeto por ID)
- `POST /projects/create-new-project` (Criar novo projeto)
- `PATCH /projects/:id/update` (Atualizar projeto)
- `DELETE /projects/:id/delete` (Deletar projeto)
- `POST /projects/:id/invite` (Gerar link de convite enviando body: { email })
- `POST /projects/accept-invite` (Aceitar convite enviando body: { token, currentUser })

### 🎯 Requisitos Técnicos Obrigatórios

1. **Autenticação Automática:**
   - Todas as Server Actions devem ler o `access_token` armazenado nos cookies do Next.js (via `cookies()` do `next/headers`) e injetá-lo automaticamente no header `Authorization: Bearer <token>` de cada requisição para a API.

2. **Server Actions (`web/lib/actions/projects.ts`):**
   - Utilize a diretiva `"use server";`.
   - Implemente as seguintes actions tipadas:
     - `getAllProjectsAction()`
     - `getProjectByIdAction(id: string)`
     - `createProjectAction(data: any)`
     - `updateProjectAction(id: string, data: any)`
     - `deleteProjectAction(id: string)`
     - `inviteToProjectAction(id: string, email?: string)`
     - `acceptProjectInviteAction(token: string, currentUser: { id: string, name: string, email: string, avatarUrl: string | null })`
   - **Tratamento de resposta:** Retorne um padrão previsível para o front-end, ex: `{ success: true, data: ... }` ou `{ success: false, error: "Mensagem de erro amigável" }`.

3. **Validação e Tipagem com Zod (`src/lib/schemas/projects.ts`):**
   - Crie os schemas de validação com mensagens de erro em português:
     - **`CreateProjectSchema`**: Defina campos comuns de projeto (como nome obrigatório, descrição opcional).
     - **`UpdateProjectSchema`**: Versão parcial do schema de criação (`.partial()`).
     - **`InviteEmailSchema`**: Validação de e-mail opcional ou string de e-mail válida para o convite.

### 📁 Estrutura de Pastas Esperada
Por favor, gere apenas o código focado no backend-do-frontend nos seguintes arquivos:
- `web/lib/schemas/projects.ts` (Schemas Zod)
- `web/lib/actions/projects.ts` (Funções assíncronas de Server Actions com fetch para a API)