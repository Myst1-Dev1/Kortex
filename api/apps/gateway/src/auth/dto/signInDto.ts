import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({example: 'john@gmail.com', description:'Email único do usuário'})
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha com no mínimo 8 caracteres', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class OAuthSignInDto {
  @ApiProperty({example:'google ou github', description:'Fazer login com google ou github'})
  @IsIn(['google', 'github'])
  provider!: 'google' | 'github';

  @ApiProperty({example:'1rtrt', description:'Id da conta google ou github'})
  @IsString()
  @IsNotEmpty()
  providerAccountId!: string;

  @ApiProperty({example:'zero@gmail.com', description:'Email da conta google ou github'})
  @IsEmail()
  email!: string;

  @ApiProperty({example:'zero dev', description:'Nome da conta google ou github', required: false})
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({example:'zero-dev.png', description:'Foto de avatar da conta google ou github', required: false})
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({example:'zero@gmail.com', description:'Verificação de email da conta google ou github', required: false})
  @IsBoolean()
  emailVerified!: boolean;
}

