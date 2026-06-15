import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { Logger } from '@nestjs/common/services/logger.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  process.title = 'auth-service';

  const logger = new Logger('AuthServiceBootstrap');

  const rmqurl = process.env.RABBITMQ_URI ?? 'amqp://guest:guest@rabbitmq:5672';

  const queue = process.env.AUTH_QUEUE ?? 'auth_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
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

  logger.log(`Auth RMQ listen on queue ${queue} via ${rmqurl}`);
}
bootstrap();
