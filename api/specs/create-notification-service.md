Crie um microsserviço de "Notifications" utilizando NestJS, PostgreSQL (com TypeORM) e Redis. 

### 🎯 Objetivo do Serviço
Centralizar todas as notificações da plataforma. 
- O serviço é 100% assíncrono para escrita: ele NUNCA será chamado via HTTP por outros microsserviços para criar dados. Ele consome eventos via `@EventPattern` (Fire & Forget).
- Ele expõe endpoints de leitura/atualização para o Gateway de API via `@MessagePattern` (Request-Response) para buscar e marcar notificações como lidas.
- O serviço deve estar estruturado de forma que, no futuro, seja fácil plugar um Gateway de WebSockets (Socket.io) para disparar notificações em tempo real.

### 📁 Estrutura do Banco de Dados (Entidade TypeORM: `Notification`)
Gere a entidade com as seguintes colunas, decorators e tipos apropriados:
- `id`: uuid (Primary Generated Column)
- `user_id`: string (Identificador do usuário que receberá a notificação)
- `project_id`: string (Opcional, contextual da notificação)
- `type`: enum (Tipos de notificação condizentes com os eventos)
- `title`: string
- `description`: string
- `metadata`: jsonb (Dados extras flexíveis, padrão `{}`)
- `read`: boolean (Default: false)
- `created_at`: timestamp (CreateDateColumn)
- `updated_at`: timestamp (UpdateDateColumn)

### 📨 Mensageria e Eventos Consumidos (`@EventPattern`)
Crie um controller de microservices para escutar os seguintes tópicos. Cada evento deve mapear regras específicas de preenchimento de `title`, `description` e extração de dados para o `metadata`:
1. `task.created` | `task.updated` | `task.deleted`
2. `task.assigned` (Notificar o user_id atribuído)
3. `task.status.changed` (Notificar membros envolvidos)
4. `chat.message.sent` (Notificar todos no projeto exceto o sender)
5. `project.member.added` | `project.member.removed`

### ⚙️ Funcionalidades e Regras de Negócio (Service)
Implemente as seguintes funções aplicando boas práticas de Clean Code, DTOs de validação (`class-validator`) e tratamento de exceções (RpcException):
1. **Criar Notificação:** Chamado internamente pelos handlers de `@EventPattern`.
2. **Buscar Notificações Paginadas:** Busca pelo `user_id`. Deve aplicar cache do Redis.
3. **Buscar Apenas Não Lidas:** Filtro específico com cache do Redis.
4. **Marcar como Lida:** Atualiza o status de uma notificação específica validando se pertence ao `user_id`. Invalida o cache do usuário.
5. **Marcar Todas como Lidas:** Atualiza todas as não lidas de um `user_id`. Invalida o cache.
6. **Excluir Notificação:** Remove fisicamente ou soft-delete (opcional). Invalida o cache.

### ⚡ Estratégia de Cache (Redis)
- Utilize o módulo de Cache do NestJS (`cache-manager` com `cache-manager-redis-yet`).
- As chaves de cache devem ser prefixadas por usuário (ex: `notifications:user_id:*`).
- Qualquer alteração de estado (marcar como lida, deletar, nova notificação recebida) deve invalidar o cache específico daquele `user_id`.

### 🛠️ Requisitos Técnicos do Código
- Forneça o código limpo, modularizado (NotificationModule, NotificationController, NotificationService, NotificationEntity).
- Utilize o `Logger` nativo do NestJS em cada operação crítica (ex: "Evento task.created recebido para o usuário X").
- Mostre a configuração inicial do `main.ts` configurado para escutar o Microservice (defina o transporte de sua preferência, ex: Redis ou TCP).