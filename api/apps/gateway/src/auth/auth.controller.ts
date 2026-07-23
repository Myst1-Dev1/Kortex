/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import type { Express } from 'express';
import { SignUpDto } from './dto/signUpDto';
import { SignInDto } from './dto/signInDto';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_CLIENT')
    private readonly authClient: ClientProxy,

    @Inject('MEDIA_CLIENT')
    private readonly mediaClient: ClientProxy,
  ) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('avatar'))
  async signUp(
    @UploadedFile() avatar: Express.Multer.File,

    @Body()
    body: SignUpDto
  ) {
    let avatarUrl: string | null = null;

    if (avatar) {
      const bufferBase64 = avatar.buffer.toString('base64');

      const extension = avatar.originalname.split('.').pop() || 'png';

      const uploadedAvatar = await firstValueFrom(
        this.mediaClient.send('media.uploadMedia', {
          bufferBase64,
          extension,
        }),
      );

      avatarUrl = uploadedAvatar.url;
    }

    return firstValueFrom(
      this.authClient.send('auth.signUp', {
        name: body.name,
        email: body.email,
        password: body.password,
        avatarUrl,
      }),
    );
  }

  @Post('sign-in')
  async signIn(
    @Body()
    body: SignInDto
  ) {
    return firstValueFrom(
      this.authClient.send('auth.signIn', {
        email: body.email,
        password: body.password,
      }),
    );
  }

  @Post('refresh-token')
  async refreshToken(
    @Body()
    body: RefreshTokenDto
  ) {
    return firstValueFrom(
      this.authClient.send('auth.refreshToken', {
        refreshToken: body.refreshToken,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsersByIds(@Query('ids') ids: string) {
    const idArray = ids.split(',').filter(Boolean);
    return firstValueFrom(
      this.authClient.send('auth.findUsersByIds', { ids: idArray }),
    );
  }
}
