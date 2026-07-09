/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createWinstonLogger } from '../../../libs/logger/src';
import { AppModule } from './app.module';

async function bootstrap() {
  const serviceName = 'tasks-service';
  process.title = serviceName;

  const logger = createWinstonLogger(serviceName);

  const rmqurl = process.env.RABBITMQ_URI ?? 'amqp://guest:guest@rabbitmq:5672';
  const queue = process.env.TASKS_QUEUE ?? 'tasks_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      logger,
      transport: Transport.RMQ,
      options: {
        urls: [rmqurl],
        queue,
        queueOptions: { durable: false },
      },
    },
  );

  app.enableShutdownHooks();
  await app.listen();

  logger.log(`Tasks RMQ listen on queue ${queue}`, 'Bootstrap');
}
bootstrap();