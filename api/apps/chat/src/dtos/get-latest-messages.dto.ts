import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GetLatestMessagesDto {
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @IsUUID('4', { message: 'sender_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'sender_id é obrigatório.' })
  sender_id!: string;

  @IsOptional()
  limit?: number;
}
