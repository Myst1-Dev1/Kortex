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

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = this.extractUserId(client);
      if (!userId) {
        this.logger.warn(`Conexão rejeitada: token inválido`);
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      this.logger.log(`Cliente conectado: ${client.id} (user: ${userId})`);
    } catch {
      this.logger.warn(`Conexão rejeitada: erro na autenticação`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_project')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const room = `project:${data.projectId}`;
    client.join(room);
    this.logger.log(`Cliente ${client.id} entrou na sala ${room}`);
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const room = `project:${data.projectId}`;
    client.leave(room);
    this.logger.log(`Cliente ${client.id} saiu da sala ${room}`);
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
