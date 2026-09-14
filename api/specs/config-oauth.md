# Plano de Implementação: Login OAuth com Auth.js & Kortex

Este plano detalha a arquitetura e os passos necessários para integrar o fluxo de autenticação OAuth (Google e GitHub) utilizando **Auth.js** no front-end Next.js, mantendo a API NestJS (Kortex) como a autoridade central de emissão de tokens JWT, gerenciamento de sessões e persistência de usuários.

---

## 🏛️ Decisões Arquiteturais Adotadas

1. **Separação de Papéis:** O Auth.js atua exclusivamente como *broker* OAuth no front-end para captação da identidade externa. A API NestJS permanece como a única autoridade para validação de identidade, regras de negócio, vínculo de contas e emissão de tokens (`accessToken` e `refreshToken`).
2. **Segurança de Vínculo:** A vinculação automática de contas existentes ocorrerá estritamente com base em e-mails verificados (`emailVerified = true`) provenientes dos provedores OAuth, mitigando riscos de sequestro de contas (*account takeover*).
3. **Comunicação por Mensageria:** A comunicação entre o API Gateway e o microsserviço de autenticação para o fluxo OAuth seguirá o padrão estabelecido via RabbitMQ (`auth.oauthSignIn`).
4. **Isolamento de Escopo:** Recuperação de senha, alterações visuais de layout e adição de outros provedores além de Google e GitHub permanecem fora deste escopo.

---

## 📋 Passos de Execução (Back-End & Front-End)

### 1. Camada de Dados e Entidades (NestJS)
- [x] Criar a entidade/modelo de vínculo OAuth (`OAuthAccount` ou equivalente) contendo:
  - `provider` (ex: `google`, `github`)
  - `providerAccountId` (ID único fornecido pelo provedor)
  - Relacionamento N:1 com a entidade `User`
  - Índice único composto (`@@unique([provider, providerAccountId])`)
- [x] Atualizar o módulo de usuários (`users.module.ts`) e o schema de banco de dados (Prisma/TypeORM).

### 2. Regra de Negócio e Mensageria (Auth Service & Gateway)
- [x] Implementar o método de login/registro OAuth em `auth.service.ts`, reutilizando a lógica existente de geração e rotação de tokens.
- [x] Implementar validação server-side da prova de identidade OAuth recebida do client.
- [x] Criar o DTO de requisição OAuth (`OAuthSignInDto`) aplicando validações com `class-validator`.
- [x] Configurar a rota/endpoint no API Gateway e a mensagem RMQ correspondente (`auth.oauthSignIn`).
- [x] Expor o endpoint `POST /auth/oauth` na API validando provider, identidade e verificação de e-mail.

### 3. Configuração do Auth.js (Front-End Next.js)
- [x] Configurar as variáveis de ambiente necessárias (`AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`).
- [x] Criar o arquivo de configuração centralizada do Auth.js (`auth.ts`) integrando os providers do Google e do GitHub.
- [x] Configurar a rota de captura do Auth.js em `app/api/auth/[...nextauth]/route.ts`.
- [x] Implementar os callbacks do Auth.js (`signIn`, `jwt`, e `session`) para realizar a troca da identidade OAuth pelo token Kortex emitido pela API NestJS durante o fluxo de autenticação.

### 4. Interface e Rotas (UI & Middleware)
- [x] Integrar os botões de login OAuth no componente `LoginForm/login/index.tsx`, garantindo tratamento adequado de estados de carregamento (`loading`), mensagens de erro e redirecionamento (`callbackUrl`).
- [x] Ajustar `auth.ts`, `api.ts` e `middleware.ts` do front-end para unificar a estratégia de sessão e o gerenciamento de cookies seguros (`httpOnly`, `secure`).
- [x] Padronizar os fluxos de renovação de token (`refresh`), logout e revogação de sessões.
- [x] Garantir a preservação retrocompatível do login tradicional por credenciais (e-mail/senha) e do fluxo de registro existente.

### 5. Testes e Validação
- [ ] Adicionar suítes de testes unitários e de integração cobrindo:
  - Callback bem-sucedido Google / GitHub
  - Vínculo automático de contas por e-mail verificado
  - Tratamento de conflitos de identidade
  - Rejeição de tokens inválidos ou adulterados
  - Comportamento do middleware e regras de redirecionamento
  - Ciclo de vida de logout e refresh de tokens
  - Estados visuais e interativos dos botões OAuth
- [ ] Documentar as variáveis de ambiente necessárias e os endpoints de callback (`/api/auth/callback/google`, `/api/auth/callback/github`).
- [ ] Executar validação completa localmente via testes automatizados, linters, build de produção e homologação de login manual em ambiente HTTPS.

---

## 📂 Arquivos Principais Envolvidos

- **Front-End:**
  - `web/auth.ts`
  - `web/app/api/auth/[...nextauth]/route.ts`
  - `web/components/LoginForm/login/index.tsx`
  - `web/services/api.ts`
  - `web/middleware.ts`
  - `web/app/layout.tsx`
- **Back-End (NestJS / Kortex):**
  - `backend/src/modules/auth/auth.controller.ts`
  - `backend/src/modules/auth/auth.service.ts`
  - `backend/src/modules/auth/dto/oauth-sign-in.dto.ts`
  - `backend/src/modules/users/entities/user.entity.ts` (ou schema Prisma)
  - `backend/src/modules/users/users.module.ts`
  - `backend/src/modules/auth/auth.module.ts`