Atue como um desenvolvedor NestJS sênior e especialista em arquiteturas de microserviços. Com base na estrutura do projeto, precisamos implementar o fluxo completo de autenticação e comunicação via RabbitMQ entre o nosso `gateway` e o microserviço `auth`.

Por favor, crie e configure a lógica seguindo as especificações abaixo:

1. **Entidade de Usuário (TypeORM + PostgreSQL) no microserviço `auth`:**
   - Garanta que a conexão do TypeORM esteja configurada para o banco de dados PostgreSQL.
   - Crie/atualize a entidade User com os campos: `id` (UUID ou gerado pelo Postgres), `name`, `email`, `password`, `avatarUrl` (string, opcional/nullable), `issubscribe` (boolean) e `plan`.

2. **Lógica no `apps/auth/src/auth.service.ts`:**
   - **signUp:** Registro de usuário com hash de senha (use bcrypt).
   - **signIn:** Validação de credenciais e geração de JWT Access Token e Refresh Token.
   - **refreshToken:** Validação do refresh token para emitir um novo par de tokens.
   - **validateToken:** Recebe um token, valida sua assinatura/expiração e retorna os dados do usuário (necessário para o Guard do gateway).
   - **ping:** Um método simples de "health check" que retorna uma string/timestamp para garantir que o serviço está respondendo.
   - *Nota:* Integre o Redis configurado para gerenciar a lista de Refresh Tokens ativos ou invalidados, utilizando TTL.

3. **Comunicação via Microserviço (RabbitMQ) no `auth.controller.ts`:**
   - Substitua os decoradores HTTP padrão por `@MessagePattern` ou `@EventPattern` do NestJS Microservices para escutar as mensagens vindas do RabbitMQ.
   - Mapeie os patterns correspondentes para cada uma das ações da service (`sign_up`, `sign_in`, `refresh_token`, `validate_token`, `health_ping`).

4. **Configuração e Orquestração no `gateway`:**
   - Configure o `Gateway` como um cliente RabbitMQ mapeando os proxies para as filas do `auth` e do `media`.
   - Crie a controller correspondente no gateway que expõe os endpoints HTTP públicos (`POST /auth/signup`, `POST /auth/signin`, etc.).
   - **Fluxo do signUp:** O endpoint deve aceitar os dados do usuário e o arquivo de imagem do avatar (Multipart/Form-Data com Multer). O gateway deve primeiro enviar a imagem para o microserviço `media` via RabbitMQ, capturar a URL de retorno do Cloudinary e, em seguida, enviar o payload completo do usuário (incluindo o `avatarUrl`) para o microserviço `auth`.

5. **Segurança e Guards no `gateway`:**
   - Crie os Guards necessários no gateway (ex: `JwtAuthGuard`) que interceptam as requisições HTTP protegidas, enviam uma mensagem de validação de token (`validate_token`) para o microserviço `auth` via RabbitMQ/ClientProxy, e anexam o usuário retornado na requisição (`req.user`).

Gere o código estruturado, limpo e utilizando as melhores práticas do NestJS para tratamento de exceções globais em microserviços (como RpcException).