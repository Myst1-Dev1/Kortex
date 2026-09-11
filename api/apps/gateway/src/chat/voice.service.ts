import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../libs/redis/src/redis.service'; // Ajuste o caminho

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  constructor(private readonly redisService: RedisService) {}

  async joinVoiceRoom(projectId: string, userId: string): Promise<string[]> {
    const redisKey = `voice:room:${projectId}`;
    
    await this.redisService.sadd(redisKey, userId);
    await this.redisService.expire(redisKey, 14400); // 4 horas

    const activeUsers = await this.redisService.smembers(redisKey);
    this.logger.log(`Usuário ${userId} entrou na sala de voz ${projectId}. Total ativos: ${activeUsers.length}`);

    return activeUsers;
  }

  async leaveVoiceRoom(projectId: string, userId: string): Promise<string[]> {
    const redisKey = `voice:room:${projectId}`;
    
    await this.redisService.srem(redisKey, userId);
    const activeUsers = await this.redisService.smembers(redisKey);

    if (activeUsers.length === 0) {
      await this.redisService.del(redisKey);
    }

    this.logger.log(`Usuário ${userId} saiu da sala de voz ${projectId}. Restantes: ${activeUsers.length}`);

    return activeUsers;
  }

  async getVoiceRoomParticipants(projectId: string): Promise<string[]> {
    const redisKey = `voice:room:${projectId}`;
    return await this.redisService.smembers(redisKey);
  }
}