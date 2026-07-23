import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../../libs/redis/src/redis.service';
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

  private readonly CACHE_TTL = 3600;
  private readonly DEFAULT_LIMIT = 20;

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  ping() {
    return {
      ok: true,
      service: 'chat',
      now: new Date().toISOString(),
    };
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

      await this.invalidateCache(chat.project_id);

      this.logger.log(`Mensagem enviada com sucesso! ID: ${saved.id}`);
      return saved;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;

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
        relations: ['chat'],
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

      await this.invalidateCache(message.chat.project_id);

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
        relations: ['chat'],
      });

      if (!message) {
        throw new NotFoundException(`Mensagem com ID ${messageId} não encontrada.`);
      }

      if (message.sender_id !== senderId) {
        throw new ForbiddenException('Somente o autor pode excluir a mensagem.');
      }

      message.deleted = true;
      await this.messageRepository.save(message);

      await this.invalidateCache(message.chat.project_id);

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
    this.logger.log(`Buscando últimas mensagens do projeto ${dto.project_id} (cache-first)`);

    const limit = dto.limit || this.DEFAULT_LIMIT;
    const cacheKey = `chat:${dto.project_id}:latest:${limit}`;

    try {
      const cached = await this.redisService.get<Message[]>(cacheKey);
      if (cached) {
        this.logger.log(`Mensagens recuperadas do cache Redis para o projeto ${dto.project_id}.`);
        return cached;
      }

      this.logger.log(`Cache-miss para o projeto ${dto.project_id}, buscando no PostgreSQL.`);

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

      await this.redisService.set(cacheKey, messages, this.CACHE_TTL);

      this.logger.log(`Últimas ${messages.length} mensagens do projeto ${dto.project_id} salvas no cache.`);
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

  private async invalidateCache(chatId: string): Promise<void> {
    const keys = [
      `chat:${chatId}:latest:20`,
      `chat:${chatId}:latest:50`,
      `chat:${chatId}:latest:100`,
    ];

    for (const key of keys) {
      await this.redisService.del(key);
    }

    this.logger.debug(`Cache invalidado para o chat ${chatId}`);
  }
}
