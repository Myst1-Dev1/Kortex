import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_CLIENT, REDIS_OPTIONS } from './redis.constants';
import { RedisService } from './redis.service';

export interface RedisModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => RedisOptions | Promise<RedisOptions>;
}

@Module({})
export class RedisModule {
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const redisOptionsProvider: Provider = {
      provide: REDIS_OPTIONS,
      inject: options.inject ?? [ConfigService],
      useFactory: options.useFactory,
    };

    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      inject: [REDIS_OPTIONS],
      useFactory: (redisOptions: RedisOptions) => new Redis(redisOptions),
    };

    return {
      module: RedisModule,
      imports: options.imports ?? [ConfigModule],
      providers: [redisOptionsProvider, redisClientProvider, RedisService],
      exports: [RedisService],
    };
  }
}
