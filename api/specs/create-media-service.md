Atue como um desenvolvedor NestJS sênior. Preciso criar um novo microserviço chamado `media` focado no upload de imagens utilizando o Cloudinary, integrado à nossa arquitetura monorepo com RabbitMQ.

Por favor, execute e configure os seguintes passos:

1. **Dependências do Media Service:**
   - Identifique e configure as dependências necessárias para integrar o Cloudinary no NestJS (como `cloudinary`).
   - Adicione as variáveis de ambiente necessárias (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) no arquivo `.env`.

2. **Módulo e Serviço de Mídia (`apps/media/src`):**
   - Crie um `MediaService` com um método que receba os dados do arquivo (buffer/base64 e extensão) e realize o upload para o Cloudinary, retornando a URL segura (`secure_url`) da imagem.
   - **ping:** Um método simples de "health check" que retorna uma string/timestamp para garantir que o microserviço está respondendo.
   - Configure o `MediaController` utilizando `@MessagePattern` para escutar uma mensagem de upload (ex: `upload_media`) vinda do RabbitMQ. 

3. **Integração no Gateway:**
   - Adicione as dependências do `multer` e `@types/multer` no `gateway`, se ainda não existirem.
   - Configure o `gateway` para expor um endpoint HTTP `POST /media/upload` que aceita arquivos utilizando o `FileInterceptor` do Multer.
   - Faça o `gateway` converter o arquivo interceptado para um formato serializável (como enviar o buffer extraído ou converter para string Base64) e envie-o via `ClientProxy` (RabbitMQ) para o microserviço `media`.
   - Retorne a URL final do Cloudinary recebida do microserviço para o cliente.