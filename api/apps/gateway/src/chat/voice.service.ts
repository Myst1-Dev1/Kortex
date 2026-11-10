import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly rooms = new Map<string, Set<string>>();

  async joinVoiceRoom(projectId: string, userId: string): Promise<string[]> {
    if (!this.rooms.has(projectId)) {
      this.rooms.set(projectId, new Set<string>());
    }
    const room = this.rooms.get(projectId)!;
    room.add(userId);
    this.logger.log(`Usuário ${userId} entrou na sala de voz ${projectId}. Total ativos: ${room.size}`);
    return Array.from(room);
  }

  async leaveVoiceRoom(projectId: string, userId: string): Promise<string[]> {
    const room = this.rooms.get(projectId);
    if (!room) return [];
    room.delete(userId);
    if (room.size === 0) {
      this.rooms.delete(projectId);
    }
    this.logger.log(`Usuário ${userId} saiu da sala de voz ${projectId}. Restantes: ${room ? room.size : 0}`);
    return room ? Array.from(room) : [];
  }

  async getVoiceRoomParticipants(projectId: string): Promise<string[]> {
    const room = this.rooms.get(projectId);
    return room ? Array.from(room) : [];
  }
}