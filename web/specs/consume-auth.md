Atue como um Desenvolvedor Front-end Next.js Sênior. Crie a infraestrutura de autenticação no servidor (Server Actions e Cookies) para integrar com os formulários existentes em minha aplicação utilizando Next.js (App Router), Zod, e cookies seguros no lado do servidor.

### 🎯 Requisitos e Fluxo de Integraçãos

1. **Segurança de Sessão & Cookies:**
   - Crie uma estrutura para salvar o `Access Token` e o `Refresh Token` em cookies seguros a partir do servidor usando a API `cookies()` do `next/headers`.
   - Configure os cookies com as flags de segurança recomendadas: `httpOnly: true`, `secure: true`, `sameSite: "lax"` e caminhos corretos.
   - Forneça uma lógica de Server Action para limpar esses cookies (Logout).

2. **Server Actions (Comunicação com a API externa):**
   - Crie o arquivo de ações do lado do servidor (`src/app/actions/auth.ts`) com a diretiva `"use server";`.
   - Consuma a URL da API utilizando a variável de ambiente `process.env.API_URL`.
   - Implemente as seguintes Server Actions:
     - **`signInAction`**: Recebe os dados validados do formulário, faz o POST para `/auth/sign-in`, salva os tokens nos cookies e retorna `{ success: true }` ou `{ success: false, error: "Mensagem de erro amigável" }`.
     - **`signUpAction`**: Recebe os dados, faz o POST para `/auth/sign-up` e retorna o status de sucesso ou erro.
     - **`refreshSessionAction`**: Executa o fluxo de envio do refresh token salvo em cookie para `/auth/refresh-token` para obter e atualizar os tokens salvos nos cookies de forma transparente.

3. **Validação de Schemas (Zod):**
   - No arquivo `src/lib/schemas/auth.ts`, defina os schemas do Zod para validação tipada antes do envio dos dados:
     - **`LoginSchema`**: Validação de e-mail estruturado e senha obrigatória.
     - **`RegisterSchema`**: Validação de nome, e-mail estruturado, senha com regras mínimas de segurança e correspondência exata do campo de confirmação de senha.

4. **Componente de Feedback Visual:**
   - Crie um componente de Loading Spinner leve e performático usando Tailwind CSS em `src/components/ui/spinner.tsx` para que eu possa integrá-lo nos botões de envio dos meus formulários existentes em `/components/sections`.

### 📁 Estrutura de Pastas Esperada
Por favor, forneça o código organizado para os seguintes arquivos:
- `src/components/ui/spinner.tsx` (Componente de carregamento para os botões)
- `src/lib/schemas/auth.ts` (Schemas de validação do Zod para login e registro)
- `src/app/actions/auth.ts` (Todas as Server Actions de autenticação, persistência de cookies e rota de refresh)