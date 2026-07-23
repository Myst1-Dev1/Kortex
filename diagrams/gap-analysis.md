# Kortex - O Que Falta para o Projeto Ficar Completo

> Análise gerada a partir da leitura completa dos códigos `web/` e `api/`

---

## 1. CRÍTICO (Sem isso o app não funciona direito)

### 1.1 Middleware de Autenticação
- **O que:** Qualquer pessoa pode acessar `/dashboard` e `/project/[id]` sem estar logada
- **Onde criar:** `web/middleware.ts`
- **O que faz:** Lê os cookies `access_token`/`refresh_token`. Se não existir, redireciona para `/`. Se existir, verifica validade.

### 1.2 Botão de Logout Desconectado
- **O que:** O botão "Sair" na sidebar não faz nada
- **Onde:** `web/components/sideBar/index.tsx` — adicionar `onClick={() => { logoutAction(); router.push('/'); }}`

### 1.3 Estatísticas do Dashboard Hardcoded
- **O que:** Texto "Você tem 4 projetos ativos e 12 tarefas pendentes" é fixo
- **Onde:** `web/components/sections/Panel/dashboardContent/index.tsx`
- **Solução:** Calcular a partir dos dados reais de projetos e tarefas já carregados

---

## 2. IMPORTANTE (Features incompletas no frontend)

### 2.1 Editar / Deletar Projeto
- **Status:** Ações já existem em `lib/actions/projects.ts` (`updateProjectAction`, `deleteProjectAction`)
- **Onde:** `web/components/sections/ProjectContent/projectData/index.tsx`
- **Falta:** Adicionar `onClick` nos botões "Editar" e "Deletar" + criar modais de confirmação

### 2.2 Editar / Deletar / Status de Tarefa
- **Status:** Ações já existem em `lib/actions/tasks.ts`
- **Onde:** `web/components/sections/ProjectContent/listTasks/index.tsx`
- **Falta:** Botões de ação em cada tarefa + modal de edição + seletor de status

### 2.3 Editar / Deletar Mensagem no Chat
- **Status:** Ações e eventos WebSocket já existem
- **Onde:** `web/components/sections/ProjectContent/chat/index.tsx`
- **Falta:** Menu de contexto (clique longo ou botão ⋯) com opções editar/deletar

### 2.4 Atividade Recente no Dashboard
- **Status:** Dados mockados (2 linhas fixas)
- **Onde:** `web/components/sections/Panel/recentActivity/index.tsx`
- **Falta:** Criar endpoint `GET /projects/:id/activity` ou usar dados de created_at/updated_at das tasks + messages

### 2.5 Gráficos de Conclusão
- **Status:** Dados 100% mockados
- **Onde:** `web/components/sections/ProjectContent/conclusionGraphs/index.tsx`
- **Falta:** Calcular reais: total de tarefas, tarefas por status, tempo estimado vs tempo real

### 2.6 Busca de Tarefas
- **Status:** Ícone de busca existe mas não faz nada
- **Onde:** `web/components/sections/ProjectContent/listTasks/index.tsx`
- **Falta:** Input de filtro que filtra tarefas por nome no estado local

---

## 3. SISTEMA DE NOTIFICAÇÕES (Backend pronto, frontend e integração faltando)

### 3.1 Gateway HTTP para Notificações
- **Onde criar:** `api/apps/gateway/src/notifications/notifications.controller.ts`
- **Endpoints necessários:**
  - `GET /notifications?userId=` — listar paginadas
  - `GET /notifications/unread?userId=` — não lidas
  - `PATCH /notifications/:id/read` — marcar como lida
  - `PATCH /notifications/read-all` — marcar todas
  - `DELETE /notifications/:id` — deletar

### 3.2 Publicação de Eventos (o maior gap do backend)
- **Serviços que precisam publicar eventos:**

| Serviço | Evento | Onde publicar |
|---------|--------|---------------|
| Tasks | `task.created` | `tasks.service.ts` → `create()` |
| Tasks | `task.updated` | `tasks.service.ts` → `update()` |
| Tasks | `task.deleted` | `tasks.service.ts` → `remove()` |
| Tasks | `task.assigned` | `tasks.service.ts` → `create()` (quando `assigned_user_id` definido) |
| Tasks | `task.status.changed` | `tasks.service.ts` → `updateStatus()` |
| Chat | `chat.message.sent` | `chat.service.ts` → `sendMessage()` |
| Projects | `project.member.added` | `projects.service.ts` → `acceptInvite()` |
| Projects | `project.member.removed` | `projects.service.ts` → (futuro) |

- **Como:** Cada microservice precisa de um `ClientProxy` para o `notifications_queue` e fazer `this.client.emit('event.name', payload)`

### 3.3 Frontend de Notificações
- Criar componente `<Notifications />` no header (substituir bell icon placeholder)
- Adicionar `useNotificationsSocket` ou polling para buscar não lidas
- Criar dropdown/panel com lista de notificações + marcar como lida

---

## 4. BACKEND — CORREÇÕES E MELHORIAS

### 4.1 Cache dos Projetos (meio quebrado)
- `projects.service.ts` tem cache escrita mas **leitura comentada** (linhas ~37 e ~69)
- **Corrigir:** Descomentar os reads ou remover a cache se não for usar

### 4.2 Validação de Membro no Chat
- O spec pede para validar se `sender_id` é membro do projeto antes de enviar mensagem
- **Onde:** `chat.service.ts` → `sendMessage()`
- **Como:** Buscar projeto, verificar se `sender_id` está no array `participants`

### 4.3 Auto-criação do Chat ao Criar Projeto
- O projects service não emite `chat.create` ao criar projeto
- **Opção A:** Projects service publica evento, Chat service consome
- **Opção B:** Chat service já cria chat automaticamente no `sendMessage()` (já faz isso, mas é gambiarra)

### 4.4 Validação de Token via RMQ
- O spec pedia `validate_token` no auth service para o gateway usar
- Atualmente o gateway valida JWT localmente via passport-jwt
- **Impacto:** Se o usuário fizer logout, o token continua válido até expirar (15min)
- **Solução:** Implementar `validate_token` + verificar Redis session no auth service

### 4.5 Logout com Revogação de Sessão
- `auth.service.ts` tem `revokeSession()` mas **nunca é chamado**
- **Onde:** Criar `@MessagePattern('auth.logout')` no auth controller

### 4.6 Correções Menores
- `tasks/src/dtos/uploaad-task.dto.ts` — typo no nome do arquivo
- `tasks/src/tasks.module.ts` — import path `'libs/redis/src'` deveria ser relativo
- `gateway/src/gateway.controller.ts` — import não utilizado de `Http` do winston
- Todos os `*.controller.spec.ts` estão quebrados (referenciam `getHello()`)

---

## 5. SIDEBAR — ROTAS INCOMPLETAS

A sidebar tem 5 itens de menu, mas só "Dashboard" leva a uma rota real:

| Item | Rota | Status |
|------|------|--------|
| Dashboard | `/dashboard` | ✅ Funciona |
| Projetos | — | ❌ Sem rota (poderia listar todos os projetos) |
| Tarefas | — | ❌ Sem rota (poderia listar todas as tarefas do usuário) |
| Equipe | — | ❌ Sem rota (poderia listar participantes dos projetos) |
| Relatórios | — | ❌ Sem rota (poderia mostrar gráficos de produtividade) |

---

## 6. PRIORIZAÇÃO SUGERIDA

### Fase 1 — Segurança e Funcionalidade Básica
1. ✅ Middleware de auth (proteção de rotas)
2. ✅ Botão de logout funcionando
3. ✅ Stats do dashboard com dados reais
4. ✅ Editar/deletar projeto (botões + modais)
5. ✅ Editar/deletar/status de tarefa (botões + modais)

### Fase 2 — Notificações e Eventos
6. ✅ Gateway HTTP para notificações
7. ✅ Publicar eventos em tasks, chat e projects
8. ✅ Frontend de notificações (dropdown + badge)
9. ✅ Logout com revogação de sessão

### Fase 3 — UX e Polish
10. ✅ Editar/deletar mensagem no chat
11. ✅ Busca de tarefas
12. ✅ Atividade recente real
13. ✅ Gráficos com dados reais
14. ✅ Cache de projetos corrigido
15. ✅ Sidebar com todas as rotas

### Fase 4 — Extras
16. ⬜ Dark mode
17. ⬜ Social login
18. ⬜ Esqueci a senha
19. ⬜ Scroll infinito no chat
20. ⬜ Testes unitários (todos os specs estão quebrados)
