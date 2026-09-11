import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { VoiceService } from './voice.service';
import { JwtService } from '@nestjs/jwt';
import { RedisModule } from 'libs/redis/src';

@Module({
  imports: [
    AuthModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        password: config.get<string>('REDIS_PASSWORD') || undefined,
      }),
    }),
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
