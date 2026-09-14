import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsIn } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class OAuthSignInDto {
  @IsIn(['google', 'github'])
  provider!: 'google' | 'github';

  @IsString()
  @IsNotEmpty()
  providerAccountId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsBoolean()
  emailVerified!: boolean;
}

