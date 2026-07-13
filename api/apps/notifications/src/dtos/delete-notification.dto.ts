import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteNotificationDto {
  @IsUUID('4', { message: 'notification_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'notification_id é obrigatório.' })
  notification_id!: string;

  @IsUUID('4', { message: 'user_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'user_id é obrigatório.' })
  user_id!: string;
}
