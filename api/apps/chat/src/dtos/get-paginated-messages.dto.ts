import { IsNotEmpty, IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPaginatedMessagesDto {
  @IsUUID('4', { message: 'project_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'project_id é obrigatório.' })
  project_id!: string;

  @IsUUID('4', { message: 'sender_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'sender_id é obrigatório.' })
  sender_id!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
