# Kortex Web — Análise Crítica do Plano de Testes

> Análise ROI orientada por leitura direta dos 58 arquivos-fonte.
> Critérios: segurança, regras de negócio, manutenabilidade, custo de mocks.

---

## 1. Indispensável (Manter & Priorizar)

Estes testes cobrem regras de negócio críticas e caminhos de segurança. Custo de implementação baixo, garantia alta.

### 1.1 Schemas Zod (`lib/schemas/`)
**Por quê:** São a primeira defesa contra dados inválidos. Funções puras, zero mocks, execução instantânea.

| Teste | Justificativa |
|---|---|
| RegisterSchema — senha fraca rejeitada | Regex `min(8) + /[A-Z]/ + /[0-9]` protege contra senhas fracas |
| RegisterSchema — confirmPassword mismatch via `.refine()` | Lógica de validação cruzada — bug aqui permite senhas diferentes |
| LoginSchema — campos obrigatórios | `min(1)` impede submissão vazia |
| CreateTaskSchema — UUID inválido | Garante que `project_id` é válido antes de enviar ao backend |
| CreateTaskSchema — name > 255 | Previne overflow no banco |

**Remover:** Testes de "válido passa" genéricos — são redundantes com os boundary tests.

### 1.2 Middleware (`middleware.ts`)
**Por quê:** Controle de acesso. Se falha, qualquer usuário acessa rotas protegidas.

| Teste | Justificativa |
|---|---|
| Rota protegida sem cookies → redirect `/` com `?redirect=` | Testa o caminho de segurança mais crítico |
| Rota pública `/` sem cookies → continua | Garante que login funciona |
| `/projects/accept-invite?token=x` sem cookies → continua | Fluxo de convite sem auth deve funcionar |
| Matcher ignora rotas fora do padrão | `config.matcher` não deve capturar `/api` ou `/static` |

**Nota técnica:** O middleware usa `NextRequest` (não `NextResponse` como diz o plano original). Mock correto: `vi.mock('next/server', () => ({ NextResponse: { redirect: ..., next: ..., ... } }))`.

### 1.3 `fetchWithAuth` (`lib/api.ts`)
**Por quê:** Lógica de refresh automático de token. Se falha, usuário é deslogado silenciosamente.

| Teste | Justificativa |
|---|---|
| 401 → refresh → retry com novo token | Fluxo central de autenticação |
| 401 + refresh falha → não retry | Impede loop infinito de refresh |
| Token injetado no header `Authorization` | Garante que API recebe credenciais |
| `refreshTokens` falha → cookies deletados | Limpa sessão inválida |

### 1.4 `relativeTime` (`lib/utils/relativeTime.ts`)
**Por quê:** Função pura, usada em toda a app. Fronteira de 7 dias (não 60 como diz o plano).

**Correção do plano original:** O código retorna `toLocaleDateString("pt-BR")` para qualquer data >= 7 dias, não 60+. O plano original está errado aqui.

| Teste | Justificativa |
|---|---|
| `diffDay === 1` → "ontem" | Boundary exato |
| `diffDay === 7` → data formatada | Boundary exato (não "há 7 dias") |
| `diffSec < 60` → "agora" | Boundary |
| Input futuro (diff negativo) | Não testado no plano — pode retornar "agora" ou quebrar |

### 1.5 `signInAction` / `logoutAction` (`lib/actions/auth.ts`)
**Por quê:** Fluxo de autenticação completo. Testar só o happy path é insuficiente.

| Teste | Justificativa |
|---|---|
| signIn — credenciais inválidas → retorna erro sem cookies | Garante que login falho não cria sessão |
| signIn — sucesso → 3 cookies criados (user, access_token, refresh_token) | Garante que sessão é persistida |
| logoutAction → 3 cookies deletados | Garante que sessão é destruída |
| signIn — API down → catch retorna "Erro ao conectar" | Testa resilience |

---

## 2. Simplificar ou Reordenar

### 2.1 Server Actions — Testar padrão, não cada action individualmente

**Problema:** O plano lista ~25 testes de server actions, mas todas seguem o mesmo padrão:
```
1. safeParse Zod → se falha, retorna erro
2. fetch → se !ok, retorna erro do body
3. fetch throw → retorna "Erro ao conectar"
```

**Solução:** Testar 1 action por módulo no happy path + error path. Não testar `getProjectByIdAction`, `getTaskByIdAction`, `getLatestMessagesAction` etc. — são wrappers triviais de fetch.

| Manter | Remover |
|---|---|
| `signInAction` (sucesso + falha) | `getProjectByIdAction` |
| `createProjectAction` (validação + sucesso) | `getTaskByIdAction` |
| `createTaskAction` (Zod falha → sem fetch) | `getLatestMessagesAction` |
| `inviteToProjectAction` (content-type branching) | `getPaginatedMessagesAction` |
| `getAllProjectsAction` (filtro por usuário) | `editMessageAction` |
| `decodeInviteToken` (pura, sem mock) | `deleteMessageAction` |
| | `updateProjectAction` |
| | `deleteProjectAction` |
| | `updateTaskAction` |
| | `updateTaskStatusAction` |
| | `deleteTaskAction` |
| | `getNotificationsAction` |
| | `getUnreadNotificationsAction` |
| | `markAsReadAction` |
| | `markAllAsReadAction` |
| | `deleteNotificationAction` |
| | `getUsersByIdsAction` |
| | `signUpAction` (complexo demais com FormData, baixo ROI) |
| | `refreshSessionAction` |

**Resultado:** De ~25 para ~8 testes de server actions.

### 2.2 `useChatSocket` — Testar em integration, não unit

**Problema:** É um wrapper de 57 linhas sobre `socket.io-client`. Testar unitariamente exige mockar `io()` + simular eventos — o mock é mais complexo que o código real.

**Solução:** Remover dos testes unitários. Cobrir em testes E2E ou integration com um servidor Socket.IO de teste.

### 2.3 `inviteToProjectAction` — O plano ignora o branching de content-type

**Lacuna:** Esta action tem lógica especial (linha 244-252) que checa `content-type` e faz `res.json()` OU `res.text()`. Isso é um dos poucos paths não-triviais em server actions e merece teste.

### 2.4 `decodeInviteToken` — Função pura, alta prioridade

**Lacuna do plano original:** `decodeInviteToken` (linha 303-314 de `projects.ts`) é uma função pura que decodifica JWT-like com `atob`. Deveria ter testes independentes:

| Teste | Descrição |
|---|---|
| Token válido | Decodifica `projectId` e `invitedEmail` |
| Token sem `projectId` | Retorna `null` |
| Token malformado | `atob` falha, retorna `null` |
| Token com email | Retorna `{ projectId, invitedEmail }` |

---

## 3. Desprezar / Evitar (Baixo ROI)

### 3.1 Componentes UI primitivos

| Componente | Por quê remover |
|---|---|
| `Input` | forwardRef + classes Tailwind — zero lógica de negócio |
| `Spinner` | SVG estático — zero lógica |
| `LoadingDots` | 3 divs animadas — zero lógica |

**Custo:** Mock de props + render testing. **Garantia:** Zero (se quebrar, é visível imediatamente).

### 3.2 `services/theme.tsx`

**Por quê:** Depende de `localStorage`, `document.documentElement.classList`, e `next/dynamic`. O mock é tão complexo quanto o componente. A feature é trivial (toggle light/dark). Se quebrar, é visível em 2 segundos.

**Alternativa:** Teste E2E rápido (playwright) ou inspeção manual.

### 3.3 `ConclusionGraphs` — SVG rendering

**Por quê:** É um SVG estático calculado com math simples. Testar "renderiza gráfico com percentual correto" exige queries DOM complexas em SVG. O cálculo matemático (total tasks, done tasks, %) já é testado indiretamente nos dados que o componente recebe.

### 3.4 Testes de layout estático

| Remover | Por quê |
|---|---|
| `Header` — "renderiza título, toggle de tema" | Só renderiza props, zero lógica |
| `SideBar` — "renderiza links de navegação" | Links estáticos do JSX |
| `DashboardContent` — "renderiza nome do usuário" | Só exibe prop |
| `TasksAndProjects` — "renderiza cards" | Só itera array e renderiza |
| `TeamContent` — "filtra por busca" | Se worth it, testar a lógica de filtro isoladamente |
| `ReportsContent` — "calcula métricas" | Extrair cálculos para função pura e testar essa |

---

## 4. Lacunas Críticas (O que está faltando)

### 4.1 XSS via DOMPurify (`projectData/index.tsx:83`)

O componente usa `dangerouslySetInnerHTML` com `DOMPurify.sanitize()`. **Nenhum teste cobre isso.** Se DOMPurify falhar ou for removido, XSS é explorado.

**Teste necessário:**
```typescript
it('sanitiza HTML perigoso na descrição', () => {
  const malicious = '<img src=x onerror=alert(1)>';
  render(<ProjectData data={{ data: { description: malicious } }} />);
  expect(screen.queryByRole('img')).not.toHaveAttribute('onerror');
});
```

### 4.2 Optimistic UI Rollback (`useNotifications.ts`)

O hook faz rollback via `fetchNotifications()` quando a API falha. **Nenhum teste cobre o rollback.**

| Cenário | O que testar |
|---|---|
| `markAsRead` sucesso → estado atualizado | UI reflete imediatamente |
| `markAsRead` falha → rollback | Notificações voltam ao estado anterior |
| `deleteNotification` sucesso → removido | Notificação some da lista |
| `deleteNotification` falha → rollback | Notificação reaparece |
| `markAllAsRead` falha → unreadCount restaurado | Contador volta ao valor anterior |

### 4.3 Network Failure em Server Actions

O plano testa `res.ok === false`, mas não testa `fetch` throws (rede caiu). A maioria das actions tem `catch { return { success: false, error: "Erro ao conectar com o servidor" } }`. Esses paths devem ser testados.

### 4.4 `refreshTokens` — Cookie Management

`refreshTokens()` em `lib/api.ts` deleta cookies em falha (linha 32-33). Se isso falhar silenciosamente, usuário fica preso em estado autenticado com token expirado.

**Testes:**
- `refreshTokens` sem `refresh_token` nos cookies → retorna `false`
- `refreshTokens` com API retornando 400 → cookies deletados, retorna `false`
- `refreshTokens` sucesso → cookies atualizados com novos valores

### 4.5 `relativeTime` — Data Futura

O plano não testa o que acontece com `dateStr` no futuro. `diffMs` será negativo → `diffSec` negativo → nenhum `if` bate → cai no `toLocaleDateString`. Comportamento aceitável mas não documentado.

### 4.6 `signInAction` — Error Body Parsing

`signInAction` faz `res.json().catch(() => null)` (linha 46) quando `!res.ok`. Se o backend retornar HTML em vez de JSON (502, CloudFlare), o `.catch(() => null)` impede crash. Isso deve ser testado.

### 4.7 Cookie `user` não é httpOnly

`access_token` e `refresh_token` são `httpOnly`, mas o cookie `user` (com ID, nome, email) não é (linha 56-60 de `auth.ts`). Qualquer XSS lê dados do usuário. Não é teste unitário, mas é achado de segurança que deve ser documentado.

---

## 5. Resumo Consolidado

### Comparativo: Plano Original vs. Plano Otimizado

| Categoria | Original | Otimizado | Ajuste |
|---|---|---|---|
| Schemas Zod | ~20 | ~12 | Remover "válido passa" genéricos |
| Utils (relativeTime) | ~7 | ~6 | Corrigir boundary (7 dias, não 60) |
| Middleware | ~7 | ~4 | Focar nos 4 cenários críticos |
| Server Actions | ~25 | ~8 | Testar padrão, não cada wrapper |
| Hooks | ~10 | ~5 | Remover useChatSocket (integration) |
| Services | ~6 | ~3 | Remover theme (browser APIs) |
| Componentes | ~35 | ~8 | Remover UI primitivos e layouts estáticos |
| **NOVO: Segurança** | 0 | **3** | DOMPurify, cookie httpOnly, error body parsing |
| **NOVO: Rollback** | 0 | **3** | Optimistic UI rollback em useNotifications |
| **TOTAL** | **~110** | **~49** | -55% testes, +cobertura crítica |

### Distribuição Ideal de Testes

```
Segurança & Auth .............. 25% (12 testes)
  - middleware (4)
  - fetchWithAuth + refresh (4)
  - signIn/logout (3)
  - DOMPurify (1)

Validação de Dados ............ 25% (12 testes)
  - schemas Zod (12)

Regras de Negócio ............. 20% (10 testes)
  - relativeTime boundaries (4)
  - decodeInviteToken (4)
  - getAllProjects filtro (1)
  - inviteToProjectAction content-type (1)

Optimistic UI & Rollback ...... 15% (7 testes)
  - useNotifications (5)
  - error paths em actions (2)

Utilitários Puros ............. 15% (8 testes)
  - relativeTime (2 extras)
  - getUserFromCookie (3)
  - getFullUserFromCookie (3)
```

### Prioridade de Implementação

| Fase | O que | Esforço | Custo de manutenção |
|---|---|---|---|
| **1** | Schemas + relativeTime | 1h | Mínimo (funções puras) |
| **2** | Middleware | 30min | Baixo |
| **3** | fetchWithAuth + refresh | 1h | Médio (mock de cookies + fetch) |
| **4** | signIn/logout + decodeInviteToken | 1h | Médio |
| **5** | useNotifications rollback | 1h | Médio-Alto (timers + async) |
| **6** | DOMPurify sanitization | 30min | Baixo |
| | **Total estimado** | **~5h** | |

### Arquivos a Criar (Estrutura Final)

```
web/
  vitest.config.ts
  test/
    setup.ts
    schemas/
      auth.test.ts           # 12 testes
      projects.test.ts       # (com decodeInviteToken)
      tasks.test.ts
    utils/
      relativeTime.test.ts   # 6 testes
    middleware.test.ts       # 4 testes
    lib/
      api.test.ts            # 4 testes (fetchWithAuth + refresh)
      actions/
        auth.test.ts         # 3 testes (signIn + logout)
        projects.test.ts     # 3 testes (getAll + create + invite)
        tasks.test.ts        # 1 teste (create - validação Zod)
    hooks/
      useNotifications.test.ts  # 5 testes (optimistic + rollback)
    security/
      dompurify.test.ts      # 1 teste
```

**Total: ~39 testes, 13 arquivos de teste, ~5h de implementação.**
