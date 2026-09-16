import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenDto {
  @ApiProperty({example:'urutryuy567474456746756457', description:'Token gerado ao fazer login'})
  @IsString()
  refreshToken!: string;
}
