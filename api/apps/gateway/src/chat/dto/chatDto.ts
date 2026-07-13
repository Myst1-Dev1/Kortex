import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'O conteúdo da mensagem é obrigatório.' })
  @MaxLength(5000, { message: 'A mensagem deve ter no máximo 5000 caracteres.' })
  message!: string;
}

export class EditMessageDto {
  @IsUUID('4', { message: 'message_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'message_id é obrigatório.' })
  message_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'O conteúdo da mensagem é obrigatório.' })
  @MaxLength(5000, { message: 'A mensagem deve ter no máximo 5000 caracteres.' })
  message!: string;
}

export class GetPaginatedMessagesDto {
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}

export class GetLatestMessagesDto {
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @IsOptional()
  limit?: number;
}
