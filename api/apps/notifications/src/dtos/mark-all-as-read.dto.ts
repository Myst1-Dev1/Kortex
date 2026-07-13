import { IsNotEmpty, IsUUID } from 'class-validator';

export class MarkAllAsReadDto {
  @IsUUID('4', { message: 'user_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'user_id é obrigatório.' })
  user_id!: string;
}
