import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../../libs/redis/src/redis.service';
import { Notification, NotificationType } from './entities/notification.entity';
import { GetPaginatedNotificationsDto } from './dtos/get-paginated-notifications.dto';
import { GetUnreadNotificationsDto } from './dtos/get-unread-notifications.dto';
import { MarkAsReadDto } from './dtos/mark-as-read.dto';
import { MarkAllAsReadDto } from './dtos/mark-all-as-read.dto';
import { DeleteNotificationDto } from './dtos/delete-notification.dto';
import { IPaginatedNotifications } from './interfaces/notification-interfaces';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  private readonly CACHE_TTL = 3600;
  private readonly DEFAULT_LIMIT = 20;

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  ping() {
    return {
      ok: true,
      service: 'notifications',
      now: new Date().toISOString(),
    };
  }

  async handleTaskCreated(data: {
    project_id: string;
    task_id: string;
    name: string;
    author_id: string;
    members: string[];
  }) {
    this.logger.log(`Evento task.created recebido para o projeto ${data.project_id}`);

    try {
      const notifications = data.members
        .filter((memberId) => memberId !== data.author_id)
        .map((memberId) =>
          this.notificationRepository.create({
            user_id: memberId,
            project_id: data.project_id,
            type: NotificationType.TASK_CREATED,
            title: 'Nova tarefa criada',
            description: `A tarefa "${data.name}" foi criada no projeto.`,
            metadata: { task_id: data.task_id, author_id: data.author_id },
          }),
        );

      if (notifications.length > 0) {
        await this.notificationRepository.save(notifications);
        this.logger.log(`${notifications.length} notificações criadas para task.created`);
      }
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar task.created. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleTaskUpdated(data: {
    project_id: string;
    task_id: string;
    name: string;
    author_id: string;
    members: string[];
  }) {
    this.logger.log(`Evento task.updated recebido para o projeto ${data.project_id}`);

    try {
      const notifications = data.members
        .filter((memberId) => memberId !== data.author_id)
        .map((memberId) =>
          this.notificationRepository.create({
            user_id: memberId,
            project_id: data.project_id,
            type: NotificationType.TASK_UPDATED,
            title: 'Tarefa atualizada',
            description: `A tarefa "${data.name}" foi atualizada.`,
            metadata: { task_id: data.task_id, author_id: data.author_id },
          }),
        );

      if (notifications.length > 0) {
        await this.notificationRepository.save(notifications);
        this.logger.log(`${notifications.length} notificações criadas para task.updated`);
      }
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar task.updated. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleTaskDeleted(data: {
    project_id: string;
    task_id: string;
    name: string;
    author_id: string;
    members: string[];
  }) {
    this.logger.log(`Evento task.deleted recebido para o projeto ${data.project_id}`);

    try {
      const notifications = data.members
        .filter((memberId) => memberId !== data.author_id)
        .map((memberId) =>
          this.notificationRepository.create({
            user_id: memberId,
            project_id: data.project_id,
            type: NotificationType.TASK_DELETED,
            title: 'Tarefa removida',
            description: `A tarefa "${data.name}" foi removida do projeto.`,
            metadata: { task_id: data.task_id, author_id: data.author_id },
          }),
        );

      if (notifications.length > 0) {
        await this.notificationRepository.save(notifications);
        this.logger.log(`${notifications.length} notificações criadas para task.deleted`);
      }
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar task.deleted. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleTaskAssigned(data: {
    project_id: string;
    task_id: string;
    name: string;
    assigned_user_id: string;
    author_id: string;
  }) {
    this.logger.log(`Evento task.assigned recebido para o usuário ${data.assigned_user_id}`);

    try {
      const notification = this.notificationRepository.create({
        user_id: data.assigned_user_id,
        project_id: data.project_id,
        type: NotificationType.TASK_ASSIGNED,
        title: 'Tarefa atribuída a você',
        description: `Você foi atribuído à tarefa "${data.name}".`,
        metadata: { task_id: data.task_id, author_id: data.author_id },
      });

      await this.notificationRepository.save(notification);
      this.logger.log(`Notificação criada para task.assigned -> ${data.assigned_user_id}`);
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar task.assigned. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleTaskStatusChanged(data: {
    project_id: string;
    task_id: string;
    name: string;
    old_status: string;
    new_status: string;
    author_id: string;
    members: string[];
  }) {
    this.logger.log(`Evento task.status.changed recebido para o projeto ${data.project_id}`);

    try {
      const notifications = data.members
        .filter((memberId) => memberId !== data.author_id)
        .map((memberId) =>
          this.notificationRepository.create({
            user_id: memberId,
            project_id: data.project_id,
            type: NotificationType.TASK_STATUS_CHANGED,
            title: 'Status da tarefa alterado',
            description: `O status da tarefa "${data.name}" mudou de "${data.old_status}" para "${data.new_status}".`,
            metadata: {
              task_id: data.task_id,
              author_id: data.author_id,
              old_status: data.old_status,
              new_status: data.new_status,
            },
          }),
        );

      if (notifications.length > 0) {
        await this.notificationRepository.save(notifications);
        this.logger.log(`${notifications.length} notificações criadas para task.status.changed`);
      }
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar task.status.changed. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleChatMessageSent(data: {
    project_id: string;
    message_id: string;
    sender_id: string;
    message: string;
    members: string[];
  }) {
    this.logger.log(`Evento chat.message.sent recebido para o projeto ${data.project_id}`);

    try {
      const notifications = data.members
        .filter((memberId) => memberId !== data.sender_id)
        .map((memberId) =>
          this.notificationRepository.create({
            user_id: memberId,
            project_id: data.project_id,
            type: NotificationType.CHAT_MESSAGE_SENT,
            title: 'Nova mensagem no chat',
            description: `Uma nova mensagem foi enviada no chat do projeto.`,
            metadata: {
              message_id: data.message_id,
              sender_id: data.sender_id,
              preview: data.message.substring(0, 100),
            },
          }),
        );

      if (notifications.length > 0) {
        await this.notificationRepository.save(notifications);
        this.logger.log(`${notifications.length} notificações criadas para chat.message.sent`);
      }
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar chat.message.sent. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleProjectMemberAdded(data: {
    project_id: string;
    project_name: string;
    member_id: string;
    member_name: string;
    members: string[];
  }) {
    this.logger.log(`Evento project.member.added recebido para o projeto ${data.project_id}`);

    try {
      const notifications = data.members
        .filter((memberId) => memberId !== data.member_id)
        .map((memberId) =>
          this.notificationRepository.create({
            user_id: memberId,
            project_id: data.project_id,
            type: NotificationType.PROJECT_MEMBER_ADDED,
            title: 'Novo membro no projeto',
            description: `${data.member_name} foi adicionado ao projeto "${data.project_name}".`,
            metadata: { added_member_id: data.member_id },
          }),
        );

      if (notifications.length > 0) {
        await this.notificationRepository.save(notifications);
        this.logger.log(`${notifications.length} notificações criadas para project.member.added`);
      }
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar project.member.added. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async handleProjectMemberRemoved(data: {
    project_id: string;
    project_name: string;
    member_id: string;
    member_name: string;
    members: string[];
  }) {
    this.logger.log(`Evento project.member.removed recebido para o projeto ${data.project_id}`);

    try {
      const notifications = data.members
        .filter((memberId) => memberId !== data.member_id)
        .map((memberId) =>
          this.notificationRepository.create({
            user_id: memberId,
            project_id: data.project_id,
            type: NotificationType.PROJECT_MEMBER_REMOVED,
            title: 'Membro removido do projeto',
            description: `${data.member_name} foi removido do projeto "${data.project_name}".`,
            metadata: { removed_member_id: data.member_id },
          }),
        );

      if (notifications.length > 0) {
        await this.notificationRepository.save(notifications);
        this.logger.log(`${notifications.length} notificações criadas para project.member.removed`);
      }
    } catch (error: any) {
      this.logger.error(
        `Falha ao processar project.member.removed. Erro: ${error.message}`,
        error.stack,
      );
    }
  }

  async getPaginated(dto: GetPaginatedNotificationsDto): Promise<IPaginatedNotifications> {
    this.logger.log(`Buscando notificações paginadas para o usuário ${dto.user_id}`);

    const cacheKey = `notifications:${dto.user_id}:paginated:${dto.limit || this.DEFAULT_LIMIT}:${dto.offset || 0}`;

    try {
      const cached = await this.redisService.get<IPaginatedNotifications>(cacheKey);
      if (cached) {
        this.logger.log(`Notificações recuperadas do cache Redis para o usuário ${dto.user_id}.`);
        return cached;
      }

      const limit = dto.limit || this.DEFAULT_LIMIT;
      const offset = dto.offset || 0;

      const [notifications, total] = await this.notificationRepository.findAndCount({
        where: { user_id: dto.user_id },
        order: { created_at: 'DESC' },
        skip: offset,
        take: limit,
      });

      const result: IPaginatedNotifications = {
        notifications,
        total,
        hasMore: offset + limit < total,
      };

      await this.redisService.set(cacheKey, result, this.CACHE_TTL);

      this.logger.log(`${notifications.length} notificações encontradas para o usuário ${dto.user_id}.`);
      return result;
    } catch (error: any) {
      this.logger.error(
        `Falha ao buscar notificações paginadas. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar buscar as notificações. Tente novamente mais tarde.',
      );
    }
  }

  async getUnread(dto: GetUnreadNotificationsDto) {
    this.logger.log(`Buscando notificações não lidas para o usuário ${dto.user_id}`);

    const cacheKey = `notifications:${dto.user_id}:unread`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Notificações não lidas recuperadas do cache Redis para o usuário ${dto.user_id}.`);
        return cached;
      }

      const notifications = await this.notificationRepository.find({
        where: { user_id: dto.user_id, read: false },
        order: { created_at: 'DESC' },
      });

      await this.redisService.set(cacheKey, notifications, this.CACHE_TTL);

      this.logger.log(`${notifications.length} notificações não lidas encontradas para o usuário ${dto.user_id}.`);
      return notifications;
    } catch (error: any) {
      this.logger.error(
        `Falha ao buscar notificações não lidas. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar buscar as notificações. Tente novamente mais tarde.',
      );
    }
  }

  async markAsRead(dto: MarkAsReadDto) {
    this.logger.log(`Marcando notificação ${dto.notification_id} como lida para o usuário ${dto.user_id}`);

    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: dto.notification_id },
      });

      if (!notification) {
        throw new NotFoundException(`Notificação com ID ${dto.notification_id} não encontrada.`);
      }

      if (notification.user_id !== dto.user_id) {
        throw new ForbiddenException('Esta notificação não pertence ao seu usuário.');
      }

      notification.read = true;
      const saved = await this.notificationRepository.save(notification);

      await this.invalidateCache(dto.user_id);

      this.logger.log(`Notificação ${dto.notification_id} marcada como lida com sucesso!`);
      return saved;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Falha ao marcar notificação como lida. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar marcar a notificação como lida. Tente novamente mais tarde.',
      );
    }
  }

  async markAllAsRead(dto: MarkAllAsReadDto) {
    this.logger.log(`Marcando todas as notificações como lidas para o usuário ${dto.user_id}`);

    try {
      await this.notificationRepository.update(
        { user_id: dto.user_id, read: false },
        { read: true },
      );

      await this.invalidateCache(dto.user_id);

      this.logger.log(`Todas as notificações do usuário ${dto.user_id} marcadas como lidas.`);
      return { message: 'Todas as notificações foram marcadas como lidas.' };
    } catch (error: any) {
      this.logger.error(
        `Falha ao marcar todas as notificações como lidas. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar marcar as notificações como lidas. Tente novamente mais tarde.',
      );
    }
  }

  async deleteNotification(dto: DeleteNotificationDto) {
    this.logger.log(`Deletando notificação ${dto.notification_id} para o usuário ${dto.user_id}`);

    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: dto.notification_id },
      });

      if (!notification) {
        throw new NotFoundException(`Notificação com ID ${dto.notification_id} não encontrada.`);
      }

      if (notification.user_id !== dto.user_id) {
        throw new ForbiddenException('Esta notificação não pertence ao seu usuário.');
      }

      await this.notificationRepository.remove(notification);

      await this.invalidateCache(dto.user_id);

      this.logger.log(`Notificação ${dto.notification_id} deletada com sucesso!`);
      return { message: 'Notificação removida com sucesso.' };
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Falha ao deletar notificação. Erro: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao tentar deletar a notificação. Tente novamente mais tarde.',
      );
    }
  }

  private async invalidateCache(userId: string): Promise<void> {
    const keys = [
      `notifications:${userId}:unread`,
      `notifications:${userId}:paginated:20:0`,
      `notifications:${userId}:paginated:50:0`,
      `notifications:${userId}:paginated:100:0`,
    ];

    for (const key of keys) {
      await this.redisService.del(key);
    }

    this.logger.debug(`Cache invalidado para o usuário ${userId}`);
  }
}
