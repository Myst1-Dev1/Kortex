import { IsNotEmpty, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPaginatedNotificationsDto {
  @IsUUID('4', { message: 'user_id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'user_id é obrigatório.' })
  user_id!: string;

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
