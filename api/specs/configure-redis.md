Atue como um desenvolvedor NestJS sênior. Com base na estrutura do meu microserviço de autenticação (`apps/auth`), preciso que você configure a integração com o Redis. 

Por favor, execute as seguintes etapas:

1. **Dependências:** Identifique e instale as dependências necessárias para usar o Redis no NestJS (recomendo usar `ioredis` ou o pacote padrão do ecossistema do NestJS, dependendo de qual for mais performático para o nosso caso de uso).
2. **Variáveis de Ambiente:** Adicione as variáveis necessárias para a conexão do Redis (como `REDIS_HOST`, `REDIS_PORT`, etc.) no arquivo `.env` localizado na raiz.
3. **Módulo do Redis / Configuração:** - Se achar melhor, crie um módulo compartilhado de configuração ou configure diretamente no `apps/auth/src/auth.module.ts`.
   - Certifique-se de carregar as configurações de forma assíncrona usando o `ConfigService` (caso o projeto já utilize).
4. **Serviço de Autenticação:** Atualize o `apps/auth/src/auth.service.ts` para injetar o cliente do Redis, deixando uma estrutura básica pronta para operações comuns (como salvar/buscar tokens ou dados de sessão com TTL).

Antes de aplicar as alterações em massa, me explique brevemente a estratégia/biblioteca que escolheu para que eu possa validar.