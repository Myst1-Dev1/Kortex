import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tasks } from './entities/tasks.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tasks]),
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URI ?? 'amqp://guest:guest@rabbitmq:5672',
          ],
          queue: process.env.NOTIFICATIONS_QUEUE ?? 'notifications_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'PROJECTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URI ?? 'amqp://guest:guest@rabbitmq:5672',
          ],
          queue: process.env.PROJECTS_QUEUE ?? 'projects_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
