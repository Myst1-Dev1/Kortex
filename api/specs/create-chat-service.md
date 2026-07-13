Atue como um Arquiteto de Software especialista em NestJS, TypeScript e Padrões de Microserviços. 

Crie um microsserviço de **Chat** utilizando **NestJS**, **TypeORM**, **PostgreSQL** (para persistência de mensagens e histórico) e **Redis** (para cache de leitura e camada Pub/Sub/Mensageria), seguindo estritamente os princípios de **Clean Architecture**, **SOLID** e as melhores práticas de design do NestJS.

---

### 1. Arquitetura e Estrutura de Pastas
O projeto deve seguir Clean Architecture, separando claramente as responsabilidades em camadas. Apresente ou estruture o código respeitando a seguinte divisão lógica:

* **Domain (Core):** Entidades de negócio brutas (sem acoplamento com decorators do TypeORM) e interfaces de repositórios/gateways.
* **Application (Use Cases):** Casos de uso da aplicação (ex: `SendMessageUseCase`, `GetMessagesUseCase`), DTOs de entrada/saída e validações (`class-validator`).
* **Infrastructure:**
    * **Data Providers:** Implementações dos repositórios TypeORM, entidades de banco de dados, adapters de cache (Redis).
    * **Controllers/Presenters:** Pontos de entrada utilizando `@MessagePattern()` (Microservice TCP/Redis/gRPC - escolha o transporte padrão do NestJS, ex: TCP ou Redis) e interceptors de Logging.
    * **Configuration:** Módulos do NestJS, variáveis de ambiente e conexões.

---

### 2. Regras de Negócio e Casos de Uso (Use Cases)
Cada projeto possui exatamente um chat. Não existe chat global.

1.  **CreateChatForProject:** Criar automaticamente um chat quando um projeto for criado (ouvindo um evento externo de criação de projeto).
2.  **SendMessage:** Um usuário envia uma mensagem. *Regra:* Validar se o `sender_id` faz parte do projeto (receber essa lista/permissão no payload ou injetar um service de validação).
3.  **EditMessage:** Somente o autor (`sender_id`) pode editar sua própria mensagem. Marcar a flag `edited: true`.
4.  **DeleteMessage (Soft Delete):** Somente o autor (`sender_id`) pode excluir. Marcar `deleted: true`.
5.  **GetPaginatedMessages:** Buscar mensagens paginas de um projeto (ex: limit/offset ou cursor-based). Apenas participantes podem visualizar.
6.  **GetLatestMessages (Cache-First):** Buscar as últimas $N$ mensagens do chat. Deve buscar primeiro no Redis. Se houver cache-miss, busca no PostgreSQL, popula o Redis e retorna.

---

### 3. Modelagem de Dados (Banco de Dados)

#### Entidade: Chat
* `id`: UUID (Primary Key)
* `project_id`: UUID (Unique, Index)
* `created_at`: Timestamp
* `updated_at`: Timestamp

#### Entidade: Message
* `id`: UUID (Primary Key)
* `chat_id`: UUID (Foreign Key -> Chat)
* `sender_id`: UUID (Index)
* `message`: Text
* `edited`: Boolean (default: false)
* `deleted`: Boolean (default: false)
* `created_at`: Timestamp
* `updated_at`: Timestamp

---

### 4. Estratégia de Cache e Invalidação (Redis)
* O Redis deve guardar as últimas mensagens de cada chat utilizando chaves estruturadas (ex: `chat:{chat_id}:latest`).
* **Invalidação:** Sempre que uma mensagem for criada, editada ou deletada (soft delete), o cache daquele chat específico (`chat:{chat_id}:latest`) deve ser invalidado/atualizado.

---

### 5. Comunicação e Eventos (Híbrido: MessagePattern & Pub/Sub)
Este microsserviço **não utiliza HTTP**. Toda a comunicação é baseada em mensagens e eventos.

* **Entrada (Request-Response/Eventos):** Utilizar `@MessagePattern()` e `@EventPattern()` para escutar comandos e consultas de outros microsserviços.
* **Saída (Eventos):** Ao realizar mutações, publique os seguintes eventos utilizando o client de mensageria configurado no NestJS (sem chamar diretamente nenhum microsserviço):
    * `chat.message.sent`
    * `chat.message.updated`
    * `chat.message.deleted`
* **Preparação para WebSockets:** O microsserviço deve ser projetado de forma que um Gateway de WebSocket (que ficará na API Gateway ou em outro microsserviço focado em real-time) possa facilmente escutar os eventos acima via Redis Pub/Sub e repassar para os clientes conectados via socket.

---

### 6. Requisitos Não Funcionais e Qualidade de Código
* **Logging:** Implementar um `CustomLogger` (estendendo o `ConsoleLogger` do NestJS) e aplicá-lo via Interceptor ou diretamente em todos os casos de uso para rastrear a execução e tempo de resposta de cada operação.
* **Validação:** Todos os payloads de entrada devem ser validados rigidamente usando `ValidationPipe` e decorators do `class-validator`/`class-transformer`.
* **Injeção de Dependência:** Siga o padrão de inversão de dependência do SOLID. Os casos de uso devem depender de interfaces (Abstrações de Repositórios) e não das implementações do TypeORM diretamente.

Gere a estrutura de arquivos recomendada e os arquivos principais com essa implementação em TypeScript.