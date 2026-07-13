import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class EditMessageDto {
  @IsUUID('4', { message: 'message_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'message_id é obrigatório.' })
  message_id!: string;

  @IsUUID('4', { message: 'sender_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'sender_id é obrigatório.' })
  sender_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'O conteúdo da mensagem é obrigatório.' })
  @MaxLength(5000, { message: 'A mensagem deve ter no máximo 5000 caracteres.' })
  message!: string;
}
