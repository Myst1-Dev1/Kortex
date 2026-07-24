# Plano: Sistema de Notificações - Kortex

## Visão Geral

Conectar o backend de notificações (já pronto) ao gateway HTTP + frontend, com publicação de eventos dos 3 services que faltam.

---

## FASE 1 — Publicação de Eventos (Backend)

### 1.1 Tasks Service — Publicar 5 eventos

**Arquivo:** `api/apps/tasks/src/tasks.module.ts`
- Adicionar `ClientsModule.registerAsync` com token `NOTIFICATIONS_CLIENT` apontando para `notifications_queue`

**Arquivo:** `api/apps/tasks/src/tasks.service.ts`
- Injetar `@Inject('NOTIFICATIONS_CLIENT') private readonly notifClient: ClientProxy`
- Buscar participants do projeto (via projects service ou query direta) para incluir no payload `members`
- Publicar eventos:

| Método | Evento | Quando |
|--------|--------|--------|
| `create()` | `task.created` | Após `save()` |
| `create()` | `task.assigned` | Se `assigned_user_id` definido |
| `update()` | `task.updated` | Após `save()` |
| `updateStatus()` | `task.status.changed` | Após `save()` |
| `remove()` | `task.deleted` | Após `remove()` |

- Cada evento usa `this.notifClient.emit('event.name', payload)` (fire-and-forget)
- Payload precisa de `members: string[]` (IDs dos participantes do projeto) — buscar via `projects_repository` ou adicionar query ao projeto

### 1.2 Projects Service — Publicar 2 eventos

**Arquivo:** `api/apps/projects/src/projects.module.ts`
- Adicionar `ClientsModule.registerAsync` com token `NOTIFICATIONS_CLIENT`

**Arquivo:** `api/apps/projects/src/projects.service.ts`
- Injetar `@Inject('NOTIFICATIONS_CLIENT') private readonly notifClient: ClientProxy`

| Método | Evento | Quando |
|--------|--------|--------|
| `acceptInvite()` | `project.member.added` | Após salvar participante |
| (futuro) `removeMember()` | `project.member.removed` | Quando implementado |

### 1.3 Chat Service — Publicar 1 evento

**Arquivo:** `api/apps/chat/src/chat.module.ts`
- Adicionar `ClientsModule.registerAsync` com token `NOTIFICATIONS_CLIENT`

**Arquivo:** `api/apps/chat/src/chat.service.ts`
- Injetar `@Inject('NOTIFICATIONS_CLIENT') private readonly notifClient: ClientProxy`

| Método | Evento | Quando |
|--------|--------|--------|
| `sendMessage()` | `chat.message.sent` | Após `save()` |

- Buscar participants do projeto para o campo `members`

---

## FASE 2 — Gateway HTTP para Notificações (Backend)

### 2.1 Criar módulo de notificações no gateway

**Novo:** `api/apps/gateway/src/notifications/notifications.module.ts`
- `ClientsModule.register` com token `NOTIFICATIONS_CLIENT` → `notifications_queue`
- Mesmo padrão dos outros módulos do gateway

**Novo:** `api/apps/gateway/src/notifications/notifications.controller.ts`
- `@Controller('notifications')`
- Endpoints:

| Método | Rota | RMQ Pattern | Descrição |
|--------|------|-------------|-----------|
| `GET /notifications` | `?userId=&limit=&offset=` | `notifications.paginated` | Lista paginada |
| `GET /notifications/unread` | `?userId=` | `notifications.unread` | Não lidas |
| `PATCH /notifications/:id/read` | body: `{ userId }` | `notifications.markAsRead` | Marcar lida |
| `PATCH /notifications/read-all` | body: `{ userId }` | `notifications.markAllAsRead` | Marcar todas |
| `DELETE /notifications/:id` | body: `{ userId }` | `notifications.delete` | Deletar |

- Todos protegidos por `JwtAuthGuard`
- Extrair `userId` de `req.user.userId`

### 2.2 Registrar no módulo principal

**Arquivo:** `api/apps/gateway/src/gateway.module.ts`
- Importar `NotificationsGatewayModule`

### 2.3 Health check

**Arquivo:** `api/apps/gateway/src/gateway.service.ts`
- Adicionar ping ao notifications service no health check

---

## FASE 3 — Frontend Actions + Hook

### 3.1 Server Actions

**Arquivo:** `web/lib/actions/notifications.ts` (novo)
- `getNotificationsAction(userId, limit?, offset?)` → `GET /notifications`
- `getUnreadNotificationsAction(userId)` → `GET /notifications/unread`
- `markAsReadAction(notificationId, userId)` → `PATCH /notifications/:id/read`
- `markAllAsReadAction(userId)` → `PATCH /notifications/read-all`
- `deleteNotificationAction(notificationId, userId)` → `DELETE /notifications/:id`
- Todas usam `fetchWithAuth`
- Tipo `Notification` exportado com: `id, user_id, project_id, type, title, description, metadata, read, created_at`

### 3.2 Hook de polling

**Novo:** `web/hooks/useNotifications.ts`
- Busca não-lidas ao montar
- Polling a cada 30 segundos (setInterval)
- Retorna `{ notifications, unreadCount, refresh }`
- Funções: `markAsRead(id)`, `markAllAsRead()`, `deleteNotification(id)` — atualizam estado local optimisticamente

---

## FASE 4 — Frontend UI

### 4.1 Componente Dropdown de Notificações

**Novo:** `web/components/sections/Notifications/notificationDropdown.tsx`

Layout:
```
┌─────────────────────────────┐
│  Notificações    [Marcar ✓] │  ← header
├─────────────────────────────┤
│  🔵 Nova tarefa criada      │  ← item não lido (bold, bg roxo claro)
│     "Tarefa X" foi criada   │
│     há 5 min                │
├─────────────────────────────┤
│  Tarefa atribuída a você    │  ← item lido (normal)
│     "Task Y"                │
│     há 1 hora               │
├─────────────────────────────┤
│  Ver todas as notificações  │  ← footer (link futuro)
└─────────────────────────────┘
```

- Cada item: ícone por tipo, título, descrição, tempo relativo, botão deletar (×)
- Click no item → marca como lida + navega para `/project/{projectId}` (se tiver)
- Header com "Marcar todas como lidas"
- Empty state: "Nenhuma notificação ainda"
- Animação de abertura com GSAP (padrão do projeto)

### 4.2 Atualizar Header

**Arquivo:** `web/components/header/index.tsx`
- Importar `useNotifications` hook
- Substituir `<Bell>` por componente com:
  - Badge vermelho com count de não-lidas
  - `onClick` toggla dropdown
  - `<NotificationDropdown />` posicionado abaixo do sino

### 4.3 Ícones por tipo de notificação

| Tipo | Ícone (lucide-react) |
|------|----------------------|
| `task.created` | `FilePlus` |
| `task.updated` | `FileEdit` |
| `task.deleted` | `FileX` |
| `task.assigned` | `UserPlus` |
| `task.status.changed` | `ArrowRightLeft` |
| `chat.message.sent` | `MessageSquare` |
| `project.member.added` | `UserPlus` |
| `project.member.removed` | `UserMinus` |

### 4.4 Tempo relativo

**Novo:** `web/lib/utils/relativeTime.ts`
- Função `formatRelativeTime(date: string)` que retorna "agora", "há 5 min", "há 2 horas", "ontem", etc.

---

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| `api/apps/tasks/src/tasks.module.ts` | Modificar (adicionar ClientsModule) |
| `api/apps/tasks/src/tasks.service.ts` | Modificar (injetar ClientProxy + emitir 5 eventos) |
| `api/apps/projects/src/projects.module.ts` | Modificar (adicionar ClientsModule) |
| `api/apps/projects/src/projects.service.ts` | Modificar (injetar ClientProxy + emitir 2 eventos) |
| `api/apps/chat/src/chat.module.ts` | Modificar (adicionar ClientsModule) |
| `api/apps/chat/src/chat.service.ts` | Modificar (injetar ClientProxy + emitir 1 evento) |
| `api/apps/gateway/src/notifications/notifications.module.ts` | **Novo** |
| `api/apps/gateway/src/notifications/notifications.controller.ts` | **Novo** |
| `api/apps/gateway/src/gateway.module.ts` | Modificar (importar NotificationsGatewayModule) |
| `web/lib/actions/notifications.ts` | **Novo** |
| `web/hooks/useNotifications.ts` | **Novo** |
| `web/lib/utils/relativeTime.ts` | **Novo** |
| `web/components/sections/Notifications/notificationDropdown.tsx` | **Novo** |
| `web/components/header/index.tsx` | Modificar (integrar sino + dropdown) |

**Total:** 9 arquivos modificados + 5 arquivos novos
