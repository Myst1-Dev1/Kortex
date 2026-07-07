import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projects } from './entities/projects.entity';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../../../libs/redis/src/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Projects]),
    JwtModule.register({
      secret: process.env.JWT_INVITE_SECRET || 'invite_my_friends',
    }),
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
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
