import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksController } from './tasks.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'TASKS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URI ?? 'amqp://guest:guest@rabbitmq:5672',
          ],
          queue: process.env.TASKS_QUEUE ?? 'tasks_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [TasksController],
  exports: [ClientsModule],
})
export class TasksModule {}
