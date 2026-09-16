import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({example:'Johhn Doe', description:'Nome de usuário com no mínimo 2 caracteres e no máximo 100 caracteres', minLength: 2, maxLength: 100})
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name!: string;

  @ApiProperty({example: 'john@gmail.com', description:'Email único do usuário'})
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha com no mínimo 8 caracteres contendo pelo menos 1 letra maiúscula e 1 número', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos 1 letra maiúscula e 1 número',
  })
  password!: string;

  @ApiProperty({example:'zero-dev.png', description:'Foto de avatar do usuário', required: false})
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
