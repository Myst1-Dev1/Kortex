import 'reflect-metadata';
import { Logger } from '@nestjs/common/services/logger.service';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MediaModule } from './media.module';

async function bootstrap() {
  process.title = 'media-service';

  const logger = new Logger('MediaServiceBootstrap');

  const rmqurl = process.env.RABBITMQ_URI ?? 'amqp://guest:guest@rabbitmq:5672';
  const queue = process.env.MEDIA_QUEUE ?? 'media_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MediaModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqurl],
        queue,
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  app.enableShutdownHooks();

  await app.listen();

  logger.log(`Media RMQ listen on queue ${queue} via ${rmqurl}`);
}
bootstrap();
