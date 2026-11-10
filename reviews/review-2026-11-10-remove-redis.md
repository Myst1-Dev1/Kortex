# Code Review — Desativação do Redis e Otimização de Recursos da VPS (2026-11-10)

## Summary
Auditoria completa sobre a dependência do Redis no ecossistema de microsserviços da API Kortex. O uso atual de Redis apresenta anti-patterns de arquitetura (estado distribuído desnecessário para a escala atual, JWT tratado como sessão stateful via RPC, cache com dupla serialização JSON) e consome recursos desproporcionais da VPS através de healthchecks de alta frequência, snapshots em disco com fork de memória e pools de conexões TCP ociosas em 6 contêineres.

## Critical
- `apps/gateway/src/auth/jwt.strategy.ts:25-31` e `apps/auth/src/auth.service.ts:275-278` — **Gargalo Crítico de Latência e Anti-Pattern JWT Stateful:** Cada requisição autenticada no Gateway dispara uma chamada RPC via RabbitMQ para o Auth Service apenas para verificar se existe uma chave no Redis (`validateToken`). Isso anula o benefício central do JWT (validação stateless por assinatura criptográfica), multiplicando a latência de todas as rotas e sobrecarregando CPU e rede da VPS.
- `docker-compose.yml:257-275` — **Sobrecarga de CPU e Risco de OOM Killer:** O container `redis` está configurado com healthcheck executando `redis-cli ping` a cada 5 segundos (`interval: 5s`), forçando forks contínuos de processos no kernel. Além disso, a persistência padrão RDB (`redis_data:/data`) realiza snapshots em disco via `fork()` (Copy-on-Write), o que duplica o espaço de memória virtual e ameaça derrubar a VPS em situações de pouco swap.

## High
- `apps/projects/src/projects.service.ts:44-55`, `apps/tasks/src/tasks.service.ts:105-125`, `apps/notifications/src/notifications.service.ts:331-353` — **Complexidade Acidental e Otimização Prematura de Cache:** Cache de consultas básicas do PostgreSQL (`find()`) com TTL de 1 hora e rotinas manuais frágeis de invalidação (`del`). No volume de dados atual, as consultas diretas indexadas no PostgreSQL respondem em menos de 1-2ms aproveitando os `shared_buffers` nativos do banco, sem risco de dados desatualizados ou desvio de sincronia.
- `apps/projects/src/projects.service.ts:55` — **Dupla Serialização e Desperdício de CPU:** O método `projects.service.ts` executa `JSON.stringify(projects)` antes de chamar `redisService.set()`, enquanto o próprio `libs/redis/src/redis.service.ts:10` já aplica `JSON.stringify()`. No retorno, há duplo `JSON.parse()`.

## Medium
- `apps/gateway/src/chat/voice.service.ts:10-40` e `apps/chat/src/chat.service.ts:327-371` — **Duplicação de Responsabilidade em Salas de Voz:** Salas de voz WebRTC são gerenciadas no Gateway via comandos de conjunto (`sadd`, `srem`, `smembers`) no Redis, e de forma concorrente em `chat.service.ts`. Por ser uma instância única de Gateway WebSocket, o estado de participantes ativos pode ser mantido em memória local (`Map<string, Set<string>>`) ou gerenciado nativamente pelo adaptador de salas do Socket.io com custo zero de infraestrutura.
- `docker-compose.yml:29,62,94,126,158,190,222` — **Dependência Acoplada em Todos os Serviços:** Sete serviços declaram `depends_on: redis: condition: service_healthy`. Uma falha ou atraso no boot do container do Redis impede a subida de toda a aplicação.

## Low / Nitpicks
- `api/libs/redis` — Biblioteca interna não registrada no `tsconfig.json` paths nem em `nest-cli.json`, forçando imports relativos frágeis (`../../../libs/redis/src/redis.module` vs `libs/redis/src`).
- `api/package.json:53` — Dependência direta de `ioredis` pesando a árvore de `node_modules` e imagem Docker.

## Suggested Fix Directions
1. **Docker Compose:** Remover o serviço `redis`, o volume `redis_data` e todas as diretivas `depends_on.redis`.
2. **Auth & Sessions:** Migrar o controle de `refreshToken` para a tabela `users` no PostgreSQL (ex: coluna `refresh_token` ou `current_hashed_refresh_token`). No `jwt.strategy.ts`, confiar na validação criptográfica do payload JWT localmente no Gateway, eliminando a consulta RPC/Redis em cada requisição HTTP.
3. **Voice Service:** Substituir chamadas ao Redis no `VoiceService` (`apps/gateway/src/chat/voice.service.ts`) por um `Map` in-memory em Node.js.
4. **Remover Camada de Cache Redundante:** Nos serviços `projects`, `tasks`, `chat` e `notifications`, remover a injeção do `RedisService` e executar as operações de leitura/escrita diretamente no TypeORM/PostgreSQL.
5. **Limpeza de Código:** Excluir `libs/redis`, remover `ioredis` do `package.json` e as variáveis `REDIS_*` do `.env`.