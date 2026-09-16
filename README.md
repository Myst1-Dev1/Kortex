# Kortex

Inspirado no Trello, o Kortex é uma plataforma de gerenciamento de projetos que permite criar, organizar e acompanhar projetos, atribuindo participantes e responsabilidades de forma prática e centralizada.

## Visão geral

Imagine gerenciar uma equipe de 10 pessoas com 3 projetos diferentes em andamento. Com o Kortex, você pode criar e organizar cada projeto, definir os participantes e atribuir tarefas específicas para cada membro da equipe.

Cada projeto possui seu próprio ambiente de comunicação, com chat de texto, chamadas de voz e compartilhamento de tela, permitindo que os participantes mantenham o foco, compartilhem ideias e colaborem de forma eficiente.

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Socket.IO Client, Tiptap e Zod.
- **Backend:** NestJS 11, TypeScript, TypeORM e class-validator.
- **Mensageria:** RabbitMQ com NestJS Microservices.
- **Tempo real:** Socket.IO e WebRTC.
- **Persistência:** PostgreSQL 16.
- **Cache e sessões:** Redis 7.
- **Mídia:** Cloudinary para upload de avatares.
- **Testes:** Jest no backend; Vitest, Testing Library e MSW no frontend.
- **Documentação:** Swagger para documentar a API e permitir que os usuários explorem e testem cada endpoint diretamente pela interface.
- **Logs:** Winston, com biblioteca compartilhada em `api/libs/logger`.

## Arquitetura

O frontend (`web`) acessa o gateway HTTP e Socket.IO. O gateway (`api/apps/gateway`) encaminha as operações dos domínios para os microsserviços por RabbitMQ.

| Serviço | Porta | Responsabilidade |
| --- | ---: | --- |
| `gateway` | 4002 | API HTTP, autenticação de requisições e Socket.IO |
| `auth` | 4003 | Usuários, login, JWT e refresh tokens |
| `media` | 4004 | Upload de imagens via Cloudinary |
| `projects` | 4005 | Projetos, participantes e convites |
| `tasks` | 4006 | Criação, consulta e atualização de tarefas |
| `chat` | 4007 | Mensagens e histórico do chat |
| `notifications` | 4008 | Notificações e seus estados |

Dependências locais:

- PostgreSQL em `5432`, banco `kortex`.
- Redis em `6379`.
- RabbitMQ em `5672` e painel de gerenciamento em `15672`.
- Cloudinary, serviço externo usado pela aplicação de mídia.

O diagrama completo está em [diagrams/architecture.md](diagrams/architecture.md), e o modelo de dados está em [diagrams/er-diagram.md](diagrams/er-diagram.md).

## Pré-requisitos

- Node.js 22 ou compatível com o Dockerfile da API.
- npm.
- Docker e Docker Compose, para executar a infraestrutura local.
- Uma conta e credenciais do Cloudinary, caso o upload de avatares seja utilizado.

## Configuração

Não existe `package.json` na raiz. As dependências são instaladas separadamente:

```bash
cd api
npm install

cd ../web
npm install
```

Crie os arquivos `api/.env` e `web/.env`. Nunca versionar esses arquivos.

### Variáveis da API

O backend usa as seguintes variáveis, entre outras configurações de conexão:

```env
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/kortex
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DEFAULT_TTL=3600
RABBITMQ_URI=amqp://guest:guest@localhost:5672

AUTH_QUEUE=auth_queue
MEDIA_QUEUE=media_queue
PROJECTS_QUEUE=projects_queue
TASKS_QUEUE=tasks_queue
CHAT_QUEUE=chat_queue
NOTIFICATIONS_QUEUE=notifications_queue

GATEWAY_PORT=4002
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_INVITE_SECRET=change-me

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Ao executar dentro do Compose, use os nomes dos serviços como host (`postgres`, `redis` e `rabbitmq`) em vez de `localhost`. Os segredos JWT devem ser valores fortes e exclusivos fora do ambiente local.

### Variáveis do frontend

```env
API_URL=http://localhost:4002/
NEXT_PUBLIC_SOCKET_URL=http://localhost:4002
```

## Executando localmente

### Opção recomendada: Docker Compose

O Compose inicia PostgreSQL, Redis, RabbitMQ e os sete serviços do backend:

```bash
cd api
docker compose up --build
```

Em outro terminal, inicie o frontend:

```bash
cd web
npm run dev
```

Acesse:

- Aplicação web: [http://localhost:3000](http://localhost:3000)
- Gateway: [http://localhost:4002](http://localhost:4002)
- Painel RabbitMQ: [http://localhost:15672](http://localhost:15672) (`guest` / `guest` no Compose local)

### Executando a API sem Docker

Com PostgreSQL, Redis e RabbitMQ disponíveis e o `.env` configurado, execute cada serviço em um terminal separado:

```bash
cd api
npm run start:gateway
npm run start:auth
npm run start:media
npm run start:projects
npm run start:tasks
npm run start:chat
npm run start:notifications
```

## Funcionalidades

Implementadas ou disponíveis no fluxo atual:

- Cadastro e login com JWT, cookies e refresh token.
- Criação e consulta de projetos.
- Convites por link e aceite de convite.
- Criação, listagem e atribuição de tarefas.
- Chat por projeto com atualização em tempo real.
- Chat de voz e compartilhamento de tela em cada projeto.
- Editor de texto rico.
- Upload de avatar.
- Layout responsivo e animações com GSAP.

Principais páginas do frontend:

| Rota | Conteúdo |
| --- | --- |
| `/` | Login e cadastro |
| `/dashboard` | Visão geral de projetos e tarefas |
| `/projects` | Lista de projetos |
| `/project/:id` | Detalhes, tarefas e chat de um projeto |
| `/projects/accept-invite` | Aceite de convite |
| `/tasks` | Tarefas agregadas |
| `/team` | Equipe e participantes |
| `/reports` | Relatórios |

## Estrutura do repositório

```text
api/
	apps/          Microsserviços NestJS e gateway
	libs/          Bibliotecas compartilhadas
	specs/         Especificações de backend
	docker-compose.yml
web/
	app/           Rotas e páginas Next.js
	components/    Componentes de interface
	hooks/         Hooks de Socket.IO e notificações
	lib/           Ações, schemas e utilitários
	specs/         Especificações de frontend
diagrams/        Arquitetura, eventos, ER e status
```

## Rota do swagger para testes

Acesse /docs