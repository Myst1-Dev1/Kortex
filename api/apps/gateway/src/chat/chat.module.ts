import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { VoiceService } from './voice.service';
import { JwtService } from '@nestjs/jwt';

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
  providers: [ChatGateway, VoiceService, JwtService],
  exports: [ClientsModule, ChatGateway],
})
export class ChatGatewayModule {}
