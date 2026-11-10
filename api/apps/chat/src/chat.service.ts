import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dtos/send-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { GetPaginatedMessagesDto } from './dtos/get-paginated-messages.dto';
import { GetLatestMessagesDto } from './dtos/get-latest-messages.dto';
import { IPaginatedMessages } from './interfaces/chat-interfaces';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  private readonly DEFAULT_LIMIT = 20;
  private readonly voiceRooms = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @Inject('NOTIFICATIONS_CLIENT')
    private readonly notifClient: ClientProxy,

    @Inject('PROJECTS_CLIENT')
    private readonly projectsClient: ClientProxy,
  ) {}

  ping() {
    return {
      ok: true,
      service: 'chat',
      now: new Date().toISOString(),
    };
  }

  private async getProjectMembers(projectId: string): Promise<string[]> {
    try {
      const { firstValueFrom } = await import('rxjs');
      const project = await firstValueFrom(
        this.projectsClient.send('projects.getById', { id: projectId }),
      );
      const participants: Array<{ id: string }> = project?.participants ?? [];
      const memberIds = participants.map((p) => p.id);
      if (project?.author_id && !memberIds.includes(project.author_id)) {
        memberIds.push(project.author_id);
      }
      return memberIds;
    } catch (error: any) {
      this.logger.warn(`Falha ao buscar membros do projeto ${projectId}: ${error.message}`);
      return [];
    }
  }

  private async emitEvent(event: string, payload: Record<string, unknown>) {
    try {
      this.notifClient.emit(event, payload);
    } catch (error: any) {
      this.logger.warn(`Falha ao emitir evento ${event}: ${error.message}`);
    }
  }

  async createChatForProject(projectId: string): Promise<Chat> {
    this.logger.log(`Criando chat para o projeto: ${projectId}`);

    try {
      const existing = await this.chatRepository.findOne({
        where: { project_id: projectId },
      });

      if (existing) {
        this.logger.warn(`Chat já existe para o projeto ${projectId}`);
        return existing;
      }

      const chat = this.chatRepository.create({ project_id: projectId });
      const saved = await this.chatRepository.save(chat);

      this.logger.log(`Chat criado com sucesso! ID: ${saved.id} para projeto: ${projectId}`);
      return saved;
    } catch (error: any) {
      this.logger.error(
        `Falha ao criar chat para o projeto ${projectId}. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar criar o chat. Tente novamente mais tarde.',
      );
    }
  }

  async sendMessage(dto: SendMessageDto): Promise<Message> {
    this.logger.log(`Enviando mensagem no projeto ${dto.project_id} por ${dto.sender_id}`);

    try {
      const members = await this.getProjectMembers(dto.project_id);
      if (members.length > 0 && !members.includes(dto.sender_id)) {
        throw new ForbiddenException('Você não é membro deste projeto.');
      }

      let chat = await this.chatRepository.findOne({
        where: { project_id: dto.project_id },
      });

      if (!chat) {
        this.logger.log(`Chat não encontrado para o projeto ${dto.project_id}, criando automaticamente.`);
        chat = await this.createChatForProject(dto.project_id);
      }

      const message = this.messageRepository.create({
        chat_id: chat.id,
        sender_id: dto.sender_id,
        message: dto.message,
      });

      const saved = await this.messageRepository.save(message);

      await this.emitEvent('chat.message.sent', {
        project_id: chat.project_id,
        message_id: saved.id,
        sender_id: dto.sender_id,
        message: dto.message,
        members,
      });

      this.logger.log(`Mensagem enviada com sucesso! ID: ${saved.id}`);
      return saved;
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) throw error;

      this.logger.error(
        `Falha ao enviar mensagem. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar enviar a mensagem. Tente novamente mais tarde.',
      );
    }
  }

  async editMessage(dto: EditMessageDto): Promise<Message> {
    this.logger.log(`Editando mensagem ${dto.message_id} por ${dto.sender_id}`);

    try {
      const message = await this.messageRepository.findOne({
        where: { id: dto.message_id },
        relations: { chat: true },
      });

      if (!message) {
        throw new NotFoundException(`Mensagem com ID ${dto.message_id} não encontrada.`);
      }

      if (message.sender_id !== dto.sender_id) {
        throw new ForbiddenException('Somente o autor pode editar a mensagem.');
      }

      message.message = dto.message;
      message.edited = true;

      const saved = await this.messageRepository.save(message);

      this.logger.log(`Mensagem ${dto.message_id} editada com sucesso!`);
      return { ...saved, project_id: message.chat.project_id } as Message & { project_id: string };
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Falha ao editar mensagem ${dto.message_id}. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar editar a mensagem. Tente novamente mais tarde.',
      );
    }
  }

  async deleteMessage(messageId: string, senderId: string): Promise<{ message: string; project_id: string }> {
    this.logger.log(`Deletando mensagem ${messageId} por ${senderId}`);

    try {
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: { chat: true },
      });

      if (!message) {
        throw new NotFoundException(`Mensagem com ID ${messageId} não encontrada.`);
      }

      if (message.sender_id !== senderId) {
        throw new ForbiddenException('Somente o autor pode excluir a mensagem.');
      }

      message.deleted = true;
      await this.messageRepository.save(message);

      this.logger.log(`Mensagem ${messageId} deletada com sucesso (soft delete)!`);
      return { message: 'Mensagem removida com sucesso.', project_id: message.chat.project_id };
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Falha ao deletar mensagem ${messageId}. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar deletar a mensagem. Tente novamente mais tarde.',
      );
    }
  }

  async getPaginatedMessages(dto: GetPaginatedMessagesDto): Promise<IPaginatedMessages> {
    this.logger.log(`Buscando mensagens paginadas do projeto ${dto.project_id}`);

    try {
      const chat = await this.chatRepository.findOne({
        where: { project_id: dto.project_id },
      });

      if (!chat) {
        return { messages: [], total: 0, hasMore: false };
      }

      const limit = dto.limit || this.DEFAULT_LIMIT;
      const offset = dto.offset || 0;

      const [messages, total] = await this.messageRepository.findAndCount({
        where: { chat_id: chat.id, deleted: false },
        order: { created_at: 'DESC' },
        skip: offset,
        take: limit,
      });

      return {
        messages,
        total,
        hasMore: offset + limit < total,
      };
    } catch (error: any) {
      this.logger.error(
        `Falha ao buscar mensagens paginadas do projeto ${dto.project_id}. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar buscar as mensagens. Tente novamente mais tarde.',
      );
    }
  }

  async getLatestMessages(dto: GetLatestMessagesDto): Promise<Message[]> {
    this.logger.log(`Buscando últimas mensagens do projeto ${dto.project_id}`);

    const limit = dto.limit || this.DEFAULT_LIMIT;

    try {
      const chat = await this.chatRepository.findOne({
        where: { project_id: dto.project_id },
      });

      if (!chat) {
        return [];
      }

      const messages = await this.messageRepository.find({
        where: { chat_id: chat.id, deleted: false },
        order: { created_at: 'DESC' },
        take: limit,
      });

      return messages;
    } catch (error: any) {
      this.logger.error(
        `Falha ao buscar últimas mensagens do projeto ${dto.project_id}. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar buscar as últimas mensagens. Tente novamente mais tarde.',
      );
    }
  }

  async joinVoiceRoom(projectId: string, userId: string): Promise<string[]> {
    this.logger.log(`Usuário ${userId} tentando entrar na sala de voz do projeto ${projectId}`);

    const members = await this.getProjectMembers(projectId);
    if (members.length > 0 && !members.includes(userId)) {
      throw new ForbiddenException('Você não é membro deste projeto.');
    }

    if (!this.voiceRooms.has(projectId)) {
      this.voiceRooms.set(projectId, new Set<string>());
    }
    const room = this.voiceRooms.get(projectId)!;
    room.add(userId);
    const activeUsers = Array.from(room);

    await this.emitEvent('chat.voice.user_joined', {
      project_id: projectId,
      user_id: userId,
      active_users: activeUsers,
    });

    return activeUsers;
  }

  async leaveVoiceRoom(projectId: string, userId: string): Promise<string[]> {
    this.logger.log(`Usuário ${userId} saindo da sala de voz do projeto ${projectId}`);

    const room = this.voiceRooms.get(projectId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        this.voiceRooms.delete(projectId);
      }
    }
    const activeUsers = room ? Array.from(room) : [];

    await this.emitEvent('chat.voice.user_left', {
      project_id: projectId,
      user_id: userId,
      active_users: activeUsers,
    });

    return activeUsers;
  }

  async getVoiceRoomParticipants(projectId: string): Promise<string[]> {
    const room = this.voiceRooms.get(projectId);
    return room ? Array.from(room) : [];
  }
}
