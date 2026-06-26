import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@kortex/redis';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  ping() {
    return {
      ok: true,
      service: 'auth',
      now: new Date().toISOString(),
    };
  }

  private sessionKey(userId: string) {
    return `auth:session:${userId}`;
  }

  async saveSession(
    userId: string,
    data: Record<string, unknown>,
    ttlSeconds?: number,
  ) {
    const ttl =
      ttlSeconds ??
      this.configService.get<number>('REDIS_DEFAULT_TTL', 3600);

    await this.redisService.set(this.sessionKey(userId), data, ttl);
  }

  async getSession(userId: string) {
    return this.redisService.get<Record<string, unknown>>(
      this.sessionKey(userId),
    );
  }

  async revokeSession(userId: string) {
    await this.redisService.del(this.sessionKey(userId));
  }
}
