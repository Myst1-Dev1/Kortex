import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID válido do projeto ao qual a tarefa pertence',
  })
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  project_id!: string;

  // @IsUUID('4', { message: 'task_author_id deve ser um UUID válido.' })
  // task_author_id: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID opcional do usuário atribuído à tarefa',
  })
  @IsOptional()
  @IsUUID('4', { message: 'assigned_user_id deve ser um UUID válido.' })
  assigned_user_id?: string;

  @ApiProperty({
    example: 'Implementar autenticação JWT',
    description: 'Nome ou título da tarefa',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome da tarefa é obrigatório.' })
  @MaxLength(255, {
    message: 'O nome da tarefa deve ter no máximo 255 caracteres.',
  })
  name!: string;

  @ApiProperty({
    example: 'Criar as estratégias de login, refresh token e guardas de rota no gateway.',
    description: 'Descrição detalhada da tarefa',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(5000, {
    message: 'A descrição deve ter no máximo 5000 caracteres.',
  })
  description!: string;

  @ApiPropertyOptional({
    example: '4h',
    description: 'Tempo estimado para conclusão da tarefa',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'O tempo estimado deve ter no máximo 100 caracteres.',
  })
  time_estimated?: string;

  @ApiPropertyOptional({
    example: '2h 30m',
    description: 'Tempo real de conclusão da tarefa',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'O tempo de conclusão deve ter no máximo 100 caracteres.',
  })
  time_concluded?: string;
}