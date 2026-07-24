import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsController } from './notifications.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
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
    ]),
  ],
  controllers: [NotificationsController],
  exports: [ClientsModule],
})
export class NotificationsGatewayModule {}
