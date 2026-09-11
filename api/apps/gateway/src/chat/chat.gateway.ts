import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { VoiceService } from './voice.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly voiceService: VoiceService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        console.log(`[Socket] Conexão recusada (${client.id}): Token ausente`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.userId = payload.sub;
      client.data.email = payload.email;

      console.log(`[Socket] Usuário conectado com sucesso: ${payload.email} (${client.id})`);
    } catch (error:any) {
      console.log(`[Socket] Conexão recusada (${client.id}): Token inválido ->`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    if (client.data.userId) {
      // Se quiser garantir que sai da voz ao cair a conexão:
      // this.voiceService.handleDisconnectUser(client.id);
      this.server.emit('user_disconnected_clean', { userId: client.data.userId, socketId: client.id });
    }
  }

  @SubscribeMessage('join_project')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const room = `project:${data.projectId}`;
    client.join(room);
    this.logger.log(`Cliente ${client.id} entrou na sala de texto ${room}`);
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const room = `project:${data.projectId}`;
    client.leave(room);
    this.logger.log(`Cliente ${client.id} saiu da sala de texto ${room}`);
  }

  @SubscribeMessage('join_voice')
  async handleJoinVoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    try {
      const userId = client.data.userId;
      const voiceRoom = `voice:${data.projectId}`;
      const existingSocketIds = Array.from(
        this.server.sockets.adapter.rooms.get(voiceRoom) ?? [],
      );
      
      // Gerencia a sala de voz puramente via Redis no Gateway
      const activeUsers = await this.voiceService.joinVoiceRoom(data.projectId, userId);

      client.join(voiceRoom);
      this.logger.log(`Usuário ${userId} entrou na sala de voz ${voiceRoom}`);

      client.to(voiceRoom).emit('user_joined_voice', {
        userId,
        socketId: client.id,
        activeUsers,
      });
      client.emit('voice_participants', {
        socketIds: existingSocketIds,
        activeUsers,
      });
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_voice')
  async handleLeaveVoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    try {
      const userId = client.data.userId;

      const activeUsers = await this.voiceService.leaveVoiceRoom(data.projectId, userId);

      const voiceRoom = `voice:${data.projectId}`;
      client.to(voiceRoom).emit('user_left_voice', {
        userId,
        socketId: client.id,
        activeUsers,
      });
      client.leave(voiceRoom);
      this.logger.log(`Usuário ${userId} saiu da sala de voz ${voiceRoom}`);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('voice_signal')
  handleVoiceSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId: string; signal: any },
  ) {
    this.server.to(data.targetSocketId).emit('voice_signal', {
      senderSocketId: client.id,
      senderUserId: client.data.userId,
      signal: data.signal,
    });
  }

  broadcastNewMessage(projectId: string, message: any, excludeUserId?: string) {
    this.broadcastToRoom(`project:${projectId}`, 'new_message', message, excludeUserId);
  }

  broadcastEditMessage(projectId: string, message: any, excludeUserId?: string) {
    this.broadcastToRoom(`project:${projectId}`, 'edit_message', message, excludeUserId);
  }

  broadcastDeleteMessage(projectId: string, messageId: string, excludeUserId?: string) {
    this.broadcastToRoom(`project:${projectId}`, 'delete_message', { messageId }, excludeUserId);
  }

  private broadcastToRoom(room: string, event: string, data: any, excludeUserId?: string) {
    const sockets = this.server.sockets.adapter.rooms.get(room);
    if (!sockets) return;

    for (const socketId of sockets) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket && socket.data.userId !== excludeUserId) {
        socket.emit(event, data);
      }
    }
  }

  private extractUserId(client: Socket): string | null {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        this.extractTokenFromCookie(client);

      if (!token) return null;

      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      return null;
    }
  }

  private extractTokenFromCookie(client: Socket): string | null {
    try {
      const cookieHeader = client.handshake.headers?.cookie;
      if (!cookieHeader) return null;

      const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
          const [key, ...val] = c.trim().split('=');
          return [key, val.join('=')];
        }),
      );

      return cookies['access_token'] || null;
    } catch {
      return null;
    }
  }
}