import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { GetPaginatedNotificationsDto } from './dtos/get-paginated-notifications.dto';
import { GetUnreadNotificationsDto } from './dtos/get-unread-notifications.dto';
import { MarkAsReadDto } from './dtos/mark-as-read.dto';
import { MarkAllAsReadDto } from './dtos/mark-all-as-read.dto';
import { DeleteNotificationDto } from './dtos/delete-notification.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.notificationsService.ping();
  }

  @EventPattern('task.created')
  handleTaskCreated(@Payload() data: { project_id: string; task_id: string; name: string; author_id: string; members: string[] }) {
    return this.notificationsService.handleTaskCreated(data);
  }

  @EventPattern('task.updated')
  handleTaskUpdated(@Payload() data: { project_id: string; task_id: string; name: string; author_id: string; members: string[] }) {
    return this.notificationsService.handleTaskUpdated(data);
  }

  @EventPattern('task.deleted')
  handleTaskDeleted(@Payload() data: { project_id: string; task_id: string; name: string; author_id: string; members: string[] }) {
    return this.notificationsService.handleTaskDeleted(data);
  }

  @EventPattern('task.assigned')
  handleTaskAssigned(@Payload() data: { project_id: string; task_id: string; name: string; assigned_user_id: string; author_id: string }) {
    return this.notificationsService.handleTaskAssigned(data);
  }

  @EventPattern('task.status.changed')
  handleTaskStatusChanged(@Payload() data: { project_id: string; task_id: string; name: string; old_status: string; new_status: string; author_id: string; members: string[] }) {
    return this.notificationsService.handleTaskStatusChanged(data);
  }

  @EventPattern('chat.message.sent')
  handleChatMessageSent(@Payload() data: { project_id: string; message_id: string; sender_id: string; message: string; members: string[] }) {
    return this.notificationsService.handleChatMessageSent(data);
  }

  @EventPattern('project.member.added')
  handleProjectMemberAdded(@Payload() data: { project_id: string; project_name: string; member_id: string; member_name: string; members: string[] }) {
    return this.notificationsService.handleProjectMemberAdded(data);
  }

  @EventPattern('project.member.removed')
  handleProjectMemberRemoved(@Payload() data: { project_id: string; project_name: string; member_id: string; member_name: string; members: string[] }) {
    return this.notificationsService.handleProjectMemberRemoved(data);
  }

  @MessagePattern('notifications.paginated')
  getPaginated(@Payload() dto: GetPaginatedNotificationsDto) {
    return this.notificationsService.getPaginated(dto);
  }

  @MessagePattern('notifications.unread')
  getUnread(@Payload() dto: GetUnreadNotificationsDto) {
    return this.notificationsService.getUnread(dto);
  }

  @MessagePattern('notifications.markAsRead')
  markAsRead(@Payload() dto: MarkAsReadDto) {
    return this.notificationsService.markAsRead(dto);
  }

  @MessagePattern('notifications.markAllAsRead')
  markAllAsRead(@Payload() dto: MarkAllAsReadDto) {
    return this.notificationsService.markAllAsRead(dto);
  }

  @MessagePattern('notifications.delete')
  deleteNotification(@Payload() dto: DeleteNotificationDto) {
    return this.notificationsService.deleteNotification(dto);
  }
}
