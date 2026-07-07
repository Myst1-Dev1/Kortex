import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
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
  controllers: [ProjectsController],
  exports: [ClientsModule],
})
export class ProjectsModule {}
