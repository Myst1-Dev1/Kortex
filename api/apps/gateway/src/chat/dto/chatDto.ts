import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID válido do projeto ao qual a mensagem pertence',
  })
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @ApiProperty({
    example: 'Olá, gostaria de atualizar o status da tarefa.',
    description: 'Conteúdo textual da mensagem',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'O conteúdo da mensagem é obrigatório.' })
  @MaxLength(5000, { message: 'A mensagem deve ter no máximo 5000 caracteres.' })
  message!: string;
}

export class EditMessageDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID válido da mensagem que será editada',
  })
  @IsUUID('4', { message: 'message_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'message_id é obrigatório.' })
  message_id!: string;

  @ApiProperty({
    example: 'Mensagem editada com sucesso.',
    description: 'Novo conteúdo textual da mensagem',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'O conteúdo da mensagem é obrigatório.' })
  @MaxLength(5000, { message: 'A mensagem deve ter no máximo 5000 caracteres.' })
  message!: string;
}

export class GetPaginatedMessagesDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID válido do projeto para buscar as mensagens paginadas',
  })
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @ApiPropertyOptional({
    example: 20,
    description: 'Quantidade máxima de registros a serem retornados',
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Número de registros a serem ignorados (offset para paginação)',
  })
  @IsOptional()
  offset?: number;
}

export class GetLatestMessagesDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID válido do projeto para buscar as últimas mensagens',
  })
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Limite de mensagens mais recentes que deseja recuperar',
  })
  @IsOptional()
  limit?: number;
}