import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'CHAT_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URI ?? 'amqp://guest:guest@rabbitmq:5672',
          ],
          queue: process.env.CHAT_QUEUE ?? 'chat_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [ChatController],
  exports: [ClientsModule],
})
export class ChatGatewayModule {}
