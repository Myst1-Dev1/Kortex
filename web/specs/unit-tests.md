Atue como um Engenheiro de Software Sênior e Arquiteto de QA com vasta experiência em ecossistemas modernos de desenvolvimento web (React, Next.js, TypeScript e ecossistemas de testes como Vitest/Jest e Testing Library).

Sua tarefa é analisar criticamente o Plano de Testes do Kortex Web apresentado a seguir e fornecer um diagnóstico pragmático focado em ROI (Retorno sobre Investimento de Engenharia), facilidade de manutenção e segurança da aplicação.

### Instruções de Análise:
1. **O que é Indispensável (Manter & Priorizar):** Identifique os testes que cobrem regras de negócio críticas, falhas de segurança, fluxos de autenticação, middlewares, schemas e utilitários puros.
2. **O que Simplificar ou Reordenar:** Aponte testes que dependem de mocks excessivamente complexos (ex: server actions com múltiplos efeitos colaterais, sockets, timers) e sugira como simplificá-los ou focar no que realmente importa.
3. **O que Desprezar / Evitar (Baixo ROI):** Identifique testes de detalhes de implementação visual, componentes estáticos de UI ou utilitários triviais que geram alto custo de manutenção para pouca garantia real de qualidade.
4. **Lacunas Críticas (O que está faltando):** Indique cenários de erro não mapeados, tratamento de falhas de rede/servidor, atualizações otimistas (Optimistic UI), sanitização e estados de borda essenciais.
5. **Resumo Consolidado:** Apresente uma tabela ou gráfico textual comparativo com a distribuição ideal de testes sugerida.

---

### Plano de Testes para Análise:

# Kortex Web — Plano de Testes Unitários

> Análise gerada a partir da leitura completa dos 58 arquivos-fonte em `web/`
> Status atual: **nenhuma infraestrutura de testes existe** (sem jest, vitest, playwright, cypress)

---

## Infraestrutura Necessária

| Ferramenta | Uso | Instalar |
|---|---|---|
| **Vitest** | Test runner (unit + integration) | `vitest`, `@testing-library/react`, `@testing-library/jest-dom` |
| **jsdom** | Ambiente DOM para testar hooks/componentes React | `jsdom` (devDep) |
| **MSW** | Mock de Service Worker para testar server actions com fetch mockado | `msw` (devDep) |

**Comando de setup:** `npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw`

**Arquivo de config:** `vitest.config.ts` na raiz de `web/`

---

## 1. SCHEMAS (Zod) — Prioridade ALTA

### `lib/schemas/auth.ts`
| Teste | Descrição |
|---|---|
| LoginSchema — válido | Email + password válidos passam |
| LoginSchema — email inválido | Email sem `@` é rejeitado |
| LoginSchema — campos obrigatórios | Campos vazios geram erro |
| RegisterSchema — válido | Todos os campos corretos passam |
| RegisterSchema — senha fraca | Senha sem maiúscula/número/special é rejeitada |
| RegisterSchema — senhas não coincidem | confirmPassword diferente gera erro via `.refine()` |
| RegisterSchema — nome muito curto | Nome com 1 caractere é rejeitado |

### `lib/schemas/projects.ts`
| Teste | Descrição |
|---|---|
| CreateProjectSchema — válido | author_id + name passam |
| CreateProjectSchema — name vazio | name vazio é rejeitado |
| CreateProjectSchema — deadline opcional | Sem deadline passa normalmente |
| UpdateProjectSchema — parcial | Apenas `name` atualizado é válido |
| InviteEmailSchema — válido | Email formatado passa |
| InviteEmailSchema — vazio | Email opcional, string vazia passa |

### `lib/schemas/tasks.ts`
| Teste | Descrição |
|---|---|
| CreateTaskSchema — válido | project_id UUID + name passam |
| CreateTaskSchema — UUID inválido | project_id com formato errado é rejeitado |
| CreateTaskSchema — name longo | name > 255 caracteres é rejeitado |
| CreateTaskSchema — description longa | description > 5000 é rejeitada |
| UpdateTaskSchema — parcial | Apenas `name` atualizado é válido |
| UpdateTaskStatusSchema — válido | status obrigatório passa |
| UpdateTaskStatusSchema — sem status | status ausente é rejeitado |

---

## 2. UTILS — Prioridade ALTA

### `lib/utils/relativeTime.ts`
| Teste | Descrição |
|---|---|
| `agora` | Date = agora retorna "agora" |
| `ha X min` | Date de 5 minutos atrás retorna "ha 5 min" |
| `ha Xh` | Date de 3 horas atrás retorna "ha 3h" |
| `ontem` | Date de ontem retorna "ontem" |
| `ha X dias` | Date de 5 dias atrás retorna "ha 5 dias" |
| `data antiga` | Date de 60+ dias retorna data formatada (dd/mm/yyyy) |
| `string inválida` | Input inválido não throws, retorna fallback |

---

## 3. MIDDLEWARE — Prioridade ALTA

### `middleware.ts`
| Teste | Descrição |
|---|---|
| Rota pública — `/` | Acesso sem cookies continua para `/` |
| Rota pública — `/projects/accept-invite?token=x` | Acesso sem cookies continua |
| Rota protegida — sem cookies | `/dashboard` redireciona para `/` com `?redirect=/dashboard` |
| Rota protegida — com `access_token` | `/dashboard` continua normalmente |
| Rota protegida — com `refresh_token` apenas | `/dashboard` continua normalmente |
| Rotas aninhadas | `/project/abc123/tasks` é protegida corretamente |
| Não-redirecionamento | Rotas como `/api` ou `/static` não são afetadas |

---

## 4. SERVER ACTIONS (lib/actions/) — Prioridade ALTA

### `lib/api.ts`
| Teste | Descrição |
|---|---|
| fetchWithAuth — sucesso | Retorna JSON da resposta |
| fetchWithAuth — injeta Bearer | Header Authorization é adicionado |
| fetchWithAuth — 401 → refresh → retry | Em 401, chama refresh e repete a request |
| fetchWithAuth — 401 + refresh falha | Redireciona para `/` |
| refreshTokens — sucesso | POST para `/auth/refresh-token`, atualiza cookies |
| refreshTokens — falha | Redireciona para `/` |

### `lib/actions/auth.ts`
| Teste | Descrição |
|---|---|
| signInAction — sucesso | Cria cookies (user, access_token, refresh_token), retorna sucesso |
| signInAction — credenciais inválidas | Retorna erro sem criar cookies |
| signUpAction — sucesso | Envia FormData com avatar, retorna sucesso |
| signUpAction — sem avatar | Envia FormData sem arquivo |
| logoutAction | Chama API e limpa cookies |
| getUsersByIdsAction | Retorna array de usuários |

### `lib/actions/projects.ts`
| Teste | Descrição |
|---|---|
| getAllProjectsAction — filtra por usuário | Retorna apenas projetos onde user é author ou participant |
| getProjectByIdAction | Retorna projeto pelo ID |
| createProjectAction | Envia dados e retorna projeto criado |
| updateProjectAction | Envia atualização |
| deleteProjectAction | Chama delete |
| inviteToProjectAction | Gera link de convite |
| acceptProjectInviteAction | Aceita convite via token |
| decodeInviteToken | Decodifica payload do token JWT-like |

### `lib/actions/tasks.ts`
| Teste | Descrição |
|---|---|
| createTaskAction — válido | Valida com Zod, envia para API |
| createTaskAction — inválido | Validação Zod falha, retorna erro sem chamar API |
| getTasksByProjectAction | Retorna tasks do projeto |
| getTaskByIdAction | Retorna task pelo ID |
| updateTaskAction | Envia atualização |
| updateTaskStatusAction | Atualiza status |
| deleteTaskAction | Deleta task |

### `lib/actions/chat.ts`
| Teste | Descrição |
|---|---|
| sendMessageAction | Envia mensagem |
| getLatestMessagesAction | Retorna últimas mensagens |
| getPaginatedMessagesAction | Retorna mensagens paginadas |
| editMessageAction | Edita mensagem |
| deleteMessageAction | Deleta mensagem |

### `lib/actions/notifications.ts`
| Teste | Descrição |
|---|---|
| getNotificationsAction | Retorna notificações paginadas |
| getUnreadNotificationsAction | Retorna não-lidas |
| markAsReadAction | Marca como lida |
| markAllAsReadAction | Marca todas como lidas |
| deleteNotificationAction | Deleta notificação |

---

## 5. HOOKS — Prioridade MÉDIA

### `hooks/useNotifications.ts`
| Teste | Descrição |
|---|---|
| Estado inicial | `notifications: []`, `unreadCount: 0`, `loading: true` |
| Polling carrega dados | Após mount, chama `getNotificationsAction` |
| refresh | Recarrega notificações manualmente |
| markAsRead | Atualiza optimisticamente, rollback se falhar |
| markAllAsRead | Marca todas, rollback se falhar |
| deleteNotification | Remove da lista, rollback se falhar |

### `hooks/useChatSocket.ts`
| Teste | Descrição |
|---|---|
| Conecta ao socket | Cria conexão com URL correta |
| Join room | Emite `join_project` com projectId |
| Leave room | Emite `leave_project` ao desmontar |
| Escuta eventos | Callbacks são chamados em `new_message`, `edit_message`, `delete_message` |
| Desconecta | Socket é desconectado ao desmontar |

---

## 6. SERVICES — Prioridade MÉDIA

### `services/user.ts`
| Teste | Descrição |
|---|---|
| Retorna usuário dos cookies | `parseCookies()` retorna `{ user: '{"id":"1",...}' }` |
| Sem cookie user | Retorna `{ user: null }` |
| Cookie inválido | JSON.parse falha, retorna `{ user: null }` |

### `services/theme.tsx`
| Teste | Descrição |
|---|---|
| Tema padrão | `useTheme()` retorna `theme: 'light'` |
| Toggle | `toggleTheme()` alterna entre light/dark |
| Persiste no localStorage | Após toggle, valor é salvo em `kortex-theme` |
| Aplica classe no HTML | Toggle adiciona/remove `dark` class no `<html>` |

---

## 7. COMPONENTES — Prioridade MÉDIA

### Componentes UI (`components/ui/`)
| Componente | Teste |
|---|---|
| `Input` | Renderiza com props corretas, aceita ref, aplica classes dark mode |
| `Spinner` | Renderiza SVG com tamanho correto |
| `LoadingDots` | Renderiza 3 dots animados |
| `TiptapEditor` | Renderiza editor, toolbar visível, onChange sincroniza com input hidden |

### Componentes de Layout
| Componente | Teste |
|---|---|
| `Header` | Renderiza título, botão de notificações, toggle de tema, avatar do usuário |
| `SideBar` | Renderiza links de navegação, botão de logout, menu mobile toggle |
| `Modal` | Renderiza filhos, fecha ao clicar no overlay, fecha no botão X, GSAP animação |

### LoginForm
| Componente | Teste |
|---|---|
| `LoginForm` | Alterna entre Login e Register |
| `Login` | Submete email/password, redireciona em sucesso, mostra erro |
| `Register` | Submete nome/email/password/avatar, alterna para login em sucesso |

### Dashboard
| Componente | Teste |
|---|---|
| `DashboardContent` | Renderiza nome do usuário, contadores, botão criar projeto |
| `RecentActivity` | Renderiza tabela com tasks, ordena por data |
| `TasksAndProjects` | Renderiza cards de projeto com nome, descrição, participantes |
| `CreateProjectModal` | Valida formulário, submete createProjectAction |

### Projects
| Componente | Teste |
|---|---|
| `ProjectsContent` | Filtra projetos por busca, renderiza grid |
| `CreateProjectModal` | Mesmo teste acima |

### Project Detail
| Componente | Teste |
|---|---|
| `ProjectData` | Renderiza nome, descrição, deadline, participantes; botões de autor vs não-autor |
| `EditProjectModal` | Preenche dados atuais, submete updateProjectAction |
| `ConfirmDeleteProjectModal` | Confirma e chama deleteProjectAction |
| `ListTasks` | Filtra tasks por busca, renderiza lista |
| `EditTaskModal` | Exibe campos corretos para autor vs participant |
| `StatusSelector` | Altera status e chama updateTaskStatusAction |
| `TaskModal` | Cria task com dados válidos |
| `Chat` | Renderiza mensagens, envia mensagem, edita, deleta |
| `ConclusionGraphs` | Renderiza gráfico SVG com percentual correto |

### Tasks / Team / Reports
| Componente | Teste |
|---|---|
| `TasksContent` | Filtra por status e busca, renderiza tasks do usuário |
| `TeamContent` | Agrega participantes, filtra por busca |
| `ReportsContent` | Calcula métricas (total, done, %, horas) |

### Notifications
| Componente | Teste |
|---|---|
| `NotificationDropdown` | Renderiza notificações, mapeia ícones por tipo, mark all read, delete individual |

### AcceptInvite
| Componente | Teste |
|---|---|
| `AcceptInvite` | Estado de erro, sucesso, info do projeto; redireciona em sucesso |

---

## Resumo por Prioridade

| Prioridade | Categoria | Qtd Testes | Arquivos |
|---|---|---|---|
| **ALTA** | Schemas (Zod) | ~20 | `lib/schemas/*.ts` |
| **ALTA** | Utils | ~7 | `lib/utils/relativeTime.ts` |
| **ALTA** | Middleware | ~7 | `middleware.ts` |
| **ALTA** | Server Actions | ~25 | `lib/api.ts`, `lib/actions/*.ts` |
| **MÉDIA** | Hooks | ~10 | `hooks/*.ts` |
| **MÉDIA** | Services | ~6 | `services/*.ts` |
| **MÉDIA** | Componentes | ~35 | `components/**/*.tsx` |
| | **TOTAL** | **~110** | **42 arquivos** |