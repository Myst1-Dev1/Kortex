import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  project_id: string;

  // @IsUUID('4', { message: 'task_author_id deve ser um UUID válido.' })
  // task_author_id: string;

  @IsOptional()
  @IsUUID('4', { message: 'assigned_user_id deve ser um UUID válido.' })
  assigned_user_id?: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome da tarefa é obrigatório.' })
  @MaxLength(255, {
    message: 'O nome da tarefa deve ter no máximo 255 caracteres.',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(5000, {
    message: 'A descrição deve ter no máximo 5000 caracteres.',
  })
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'O tempo estimado deve ter no máximo 100 caracteres.',
  })
  time_estimated?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'O tempo de conclusão deve ter no máximo 100 caracteres.',
  })
  time_concluded?: string;
}