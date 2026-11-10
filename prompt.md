# Diagnóstico Técnico: Sobrecarga do Redis na VPS & Diretrizes de Remoção

---

## 1. Diagnóstico de Causa Raiz: Por que o Redis está pesando na VPS?

Após auditoria aprofundada na base de código da `api` e na configuração de containers, foram identificados os gargalos que estão degradando a performance e exaurindo os recursos da VPS:

### 1.1. Healthcheck Agressivo a cada 5 segundos
No arquivo `docker-compose.yml`, o serviço `redis` possui:
```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s
  timeout: 3s
  retries: 20
```
Isso força o daemon do Docker a invocar um novo processo `redis-cli` a cada **5 segundos**, ininterruptamente. Em uma VPS com núcleos compartilhados de CPU, essa frequência gera troca constante de contexto (context switching) e consumo de CPU contínuo sem justificativa técnica.

### 1.2. Snapshotting em Disco e Risco de OOM Killer (`bgsave` / Copy-on-Write)
O Redis está configurado com um volume persistente (`redis_data:/data`). Pelo padrão do Redis 7, snapshots RDB periódicos disparam a syscall `fork()` do Linux.
- Em ambientes com pouca memória RAM (1GB a 2GB) e pouco swap, o `fork()` duplica o espaço de endereçamento virtual do processo.
- Se os outros 9 containers (7 microsserviços Node.js + Postgres + RabbitMQ) estiverem alocando memória, o kernel aciona o **OOM (Out Of Memory) Killer**, derrubando contêineres arbitrariamente.

### 1.3. Competição de Recursos entre 10 Containers Docker
Cada microsserviço NestJS (`gateway`, `auth`, `projects`, `tasks`, `media`, `chat`, `notifications`) roda em uma VM isolada da engine V8 do Node.js, consumindo de 80MB a 180MB de RAM cada. Adicionar um container a mais exclusivamente para cache de dados simples e controle de conexão WebRTC é desproporcional.

### 1.4. Gargalo Crítico de Latência: JWT Stateful via RabbitMQ e Redis
No arquivo `apps/gateway/src/auth/jwt.strategy.ts`, **toda requisição HTTP** recebida pelo Gateway executa:
```typescript
this.authClient.send('auth.validateToken', { userId: payload.sub })
```
O Gateway delega via RabbitMQ para o serviço `auth`, que por sua vez consulta a chave no Redis (`redisService.get`). Isso viola o princípio central do JWT: **autenticação stateless descentralizada por assinatura criptográfica**. Criou-se um gargalo duplo de rede e serialização a cada clique no front-end.

### 1.5. Cache Redundante e Otimização Prematura
Os serviços `projects`, `tasks` e `notifications` mantêm um cache em memória com TTL de 1 hora para tabelas pequenas com poucos registros:
- O PostgreSQL com consultas indexadas por chave primária e estrangeira responde em menos de 2ms aproveitando seus próprios `shared_buffers` em memória.
- As rotinas manuais de invalidação de cache eram incompletas e propensas a leituras inconsistentes.
- Em `projects.service.ts`, havia inclusive **dupla serialização** (`JSON.stringify` executado antes de chamar `redisService.set`, que aplicava `JSON.stringify` novamente).

---

## 2. Análise de Trade-offs & ADR

### Trade-offs
| Abordagem | Prós | Contras | Veredito |
| :--- | :--- | :--- | :--- |
| **Opção A: Remoção Definitiva do Redis (Recomendada)** | - Elimina 1 container e 1 volume de disco.<br>- Reduz footprint de RAM e CPU imediatamente.<br>- Elimina conexões TCP ociosas dos 6 microsserviços.<br>- Simplifica arquitetura e reduz carga cognitiva.<br>- JWT passa a ser stateless. | - Consultas vão direto ao PostgreSQL (suportado com folga pelo volume atual).<br>- Participantes de voz ficam em memória local no Gateway. | **Adotada (Alinhada ao Princípio de Pareto e KISS)** |
| **Opção B: Otimização do Redis** | - Mantém cache secundário em memória.<br>- Preserva a estrutura atual de código. | - Continua exigindo container, volume, healthcheck e pools de conexão.<br>- Mantém o custo de manutenção do estado distribuído. | **Rejeitada (Débito Técnico e Desperdício de Recursos)** |

### ADR (Architectural Decision Record)
- **Contexto:** A VPS apresenta sobrecarga por manter 10 contêineres ativos, dos quais o Redis é utilizado apenas para cache prematuro de consultas triviais e checagem de sessão que descaracteriza o uso do JWT.
- **Decisão:** Descontinuar o container do Redis, remover a biblioteca `libs/redis` e a dependência `ioredis`, persistir o `refreshToken` na tabela `users` do PostgreSQL e gerenciar salas de voz WebRTC na memória do Gateway.
- **Consequências:** Redução imediata de memória e CPU na VPS, menor latência nas chamadas HTTP autenticadas e simplificação da stack de desenvolvimento e deploy.

---

## 3. Instruções para o Agente Jupiter: Execução da Refatoração

> **Para Jupiter (Senior Back-End Developer):**
> Execute a remoção completa do Redis conforme o roteiro abaixo. Siga estritamente as regras de imutabilidade, fail-fast e o workflow Docker do projeto.
>
> ⚠️ **Regra Obrigatória de Terminal:** Não execute comandos no host. Utilize sempre os aliases oficiais:
> - Para subir containers: `dup`
> - Para derrubar containers: `ddown`
> - Para executar comandos dentro dos serviços: `dshell [serviço] -c "comando"`

### Tarefa 1: Limpeza da Infraestrutura Docker e Variáveis de Ambiente
1. No arquivo `api/docker-compose.yml`:
   - Remover a definição do serviço `redis` (linhas 257 a 277).
   - Remover o volume `redis_data` da seção `volumes:` (linha 312).
   - Remover o bloco `redis: condition: service_healthy` de `depends_on` em todos os serviços: `gateway`, `auth`, `projects`, `tasks`, `media`, `chat` e `notifications`.
2. No arquivo `api/.env`:
   - Remover as variáveis `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` e `REDIS_DEFAULT_TTL`.

### Tarefa 2: Refatoração do Serviço de Autenticação (`auth` e `gateway`)
1. **Entidade `User` (`api/apps/auth/src/users/user.entity.ts`):**
   - Adicionar o campo nullable para persistência segura do refresh token:
     ```typescript
     @Column({ type: 'varchar', length: 500, nullable: true, name: 'refresh_token' })
     refreshToken?: string | null;
     ```
2. **Serviço de Autenticação (`api/apps/auth/src/auth.service.ts`):**
   - Remover o construtor com injeção de `RedisService`.
   - Em `signUp`, `signIn` e `oauthSignIn`: salvar o `refreshToken` gerado diretamente na entidade do usuário (`await this.userRepository.update(user.id, { refreshToken: tokens.refreshToken })`).
   - Em `refreshToken`: buscar o usuário pelo `payload.sub`, comparar se o `user.refreshToken === dto.refreshToken`, emitir os novos tokens e atualizar o banco.
   - Em `revokeSession`: atualizar `refreshToken: null` no banco para o `userId`.
   - Em `validateToken`: verificar a existência do usuário no PostgreSQL (`await this.userRepository.existsBy({ id: userId })`).
   - Remover os métodos obsoletos `saveSession` e `getSession` atrelados ao Redis.
3. **Módulo de Autenticação (`api/apps/auth/src/auth.module.ts`):**
   - Remover a importação de `RedisModule` e sua chamada `RedisModule.forRootAsync(...)`.
4. **Validação de Token no Gateway (`api/apps/gateway/src/auth/jwt.strategy.ts`):**
   - O `JwtStrategy` já valida a assinatura e data de expiração do token via `passport-jwt`.
   - Remover a chamada bloqueante `this.authClient.send('auth.validateToken', ...)`. O método `validate(payload)` deve retornar diretamente o payload decodificado:
     ```typescript
     async validate(payload: { sub: string; email: string }) {
       if (!payload || !payload.sub) {
         throw new UnauthorizedException('Token inválido.');
       }
       return {
         userId: payload.sub,
         email: payload.email,
       };
     }
     ```
   - Isso elimina 1 requisição RabbitMQ a cada chamada HTTP da aplicação!

### Tarefa 3: Refatoração do Serviço de Voz e Chat Gateway
1. **Voice Service no Gateway (`api/apps/gateway/src/chat/voice.service.ts`):**
   - Remover a injeção de `RedisService`.
   - Utilizar uma estrutura em memória nativa do Node.js:
     ```typescript
     @Injectable()
     export class VoiceService {
       private readonly logger = new Logger(VoiceService.name);
       private readonly rooms = new Map<string, Set<string>>();

       async joinVoiceRoom(projectId: string, userId: string): Promise<string[]> {
         if (!this.rooms.has(projectId)) {
           this.rooms.set(projectId, new Set<string>());
         }
         const room = this.rooms.get(projectId)!;
         room.add(userId);
         this.logger.log(`Usuário ${userId} entrou na sala ${projectId}. Total ativos: ${room.size}`);
         return Array.from(room);
       }

       async leaveVoiceRoom(projectId: string, userId: string): Promise<string[]> {
         const room = this.rooms.get(projectId);
         if (!room) return [];
         room.delete(userId);
         if (room.size === 0) {
           this.rooms.delete(projectId);
         }
         this.logger.log(`Usuário ${userId} saiu da sala ${projectId}. Restantes: ${room ? room.size : 0}`);
         return room ? Array.from(room) : [];
       }

       async getVoiceRoomParticipants(projectId: string): Promise<string[]> {
         const room = this.rooms.get(projectId);
         return room ? Array.from(room) : [];
       }
     }
     ```
2. **Módulo do Chat Gateway (`api/apps/gateway/src/chat/chat.module.ts`):**
   - Remover a importação de `RedisModule` e sua chamada `RedisModule.forRootAsync(...)`.
3. **Chat Service (`api/apps/chat/src/chat.service.ts` e `chat.module.ts`):**
   - Remover a injeção de `RedisService` e o `RedisModule`.
   - Em `getLatestMessages`: remover a consulta e escrita no Redis, buscando diretamente de `this.messageRepository.find(...)`.
   - Remover o método `invalidateCache`.
   - Se os endpoints de voz em `chat.service.ts` ainda forem chamados via message broker, implementar estrutura em memória análoga com `Map<string, Set<string>>` ou integrar com o gateway.

### Tarefa 4: Remoção de Cache nos Demais Serviços
1. **Projects (`api/apps/projects`):**
   - Em `projects.module.ts`: remover `RedisModule`.
   - Em `projects.service.ts`: remover `RedisService`, `this.CACHE_KEY` e `this.CACHE_TTL`.
   - Em `getAllProjects` e `getProjectById`: ler diretamente de `this.projectsRepository`.
   - Em `createProject`, `updateProject`, `deleteProject`, `addMember`: remover as chamadas `redisService.del(...)`.
2. **Tasks (`api/apps/tasks`):**
   - Em `tasks.module.ts`: remover `RedisModule`.
   - Em `tasks.service.ts`: remover `RedisService` e constantes de TTL.
   - Em `findByProject` e `findOne`: consultar diretamente `this.tasksRepository`.
   - Em `createTask`, `updateTask`, `updateStatus`, `deleteTask`: remover as chamadas `redisService.del(...)`.
3. **Notifications (`api/apps/notifications`):**
   - Em `notifications.module.ts`: remover `RedisModule`.
   - Em `notifications.service.ts`: remover `RedisService` e constantes de cache.
   - Em `getPaginated` e `getUnread`: consultar diretamente `this.notificationRepository`.
   - Remover o método `invalidateCache`.

### Tarefa 5: Remoção da Biblioteca `libs/redis` e Dependência `ioredis`
1. Excluir o diretório `api/libs/redis`.
2. No arquivo `api/package.json`:
   - Remover a dependência `"ioredis": "^5.11.1"`.
3. Rodar via Docker a atualização das dependências e build:
   - Matheus, execute `dshell gateway -c "npm install"` para atualizar o lockfile.

### Tarefa 6: Validação e Testes
1. Rodar os testes unitários existentes nos serviços afetados:
   - `dshell auth -c "npm run test"`
   - `dshell projects -c "npm run test"`
   - `dshell tasks -c "npm run test"`
   - `dshell gateway -c "npm run test"`
2. Reiniciar o ambiente com os aliases para garantir funcionamento idempotente:
   - `ddown`
   - `dup`