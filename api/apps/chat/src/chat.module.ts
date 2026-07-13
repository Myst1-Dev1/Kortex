import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { RedisModule } from '../../../libs/redis/src/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Chat, Message]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        password: config.get<string>('REDIS_PASSWORD') || undefined,
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
