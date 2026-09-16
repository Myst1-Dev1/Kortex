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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import type { Express } from 'express';
import { SignUpDto } from './dto/signUpDto';
import { SignInDto, OAuthSignInDto } from './dto/signInDto';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiConsumes, 
  ApiBody, 
  ApiBearerAuth, 
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_CLIENT')
    private readonly authClient: ClientProxy,

    @Inject('MEDIA_CLIENT')
    private readonly mediaClient: ClientProxy,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Criar um novo usuário com avatar opcional' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados de cadastro e arquivo de imagem do avatar',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João da Silva' },
        email: { type: 'string', example: 'joao@email.com' },
        password: { type: 'string', example: 'senha123F' },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem do avatar',
        },
      },
      required: ['name', 'email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
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
  @ApiOperation({ summary: 'Realizar login na aplicação' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso, retorna os tokens.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
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

  @Post('oauth')
  @ApiOperation({ summary: 'Autenticação via OAuth' })
  @ApiBody({ type: OAuthSignInDto })
  @ApiResponse({ status: 200, description: 'Autenticação OAuth realizada com sucesso.' })
  async oauthSignIn(
    @Body()
    body: OAuthSignInDto
  ) {
    return firstValueFrom(
      this.authClient.send('auth.oauthSignIn', body),
    );
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Atualizar o token de acesso (Access Token)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Novo token gerado com sucesso.' })
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('users')
  @ApiOperation({ summary: 'Buscar múltiplos usuários por IDs' })
  @ApiQuery({ name: 'ids', description: 'IDs separados por vírgula (ex: id1,id2,id3)', example: '1,2,3' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getUsersByIds(@Query('ids') ids: string) {
    const idArray = ids.split(',').filter(Boolean);
    return firstValueFrom(
      this.authClient.send('auth.findUsersByIds', { ids: idArray }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Encerrar sessão do usuário (Logout)' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async logout(@Req() req) {
    return firstValueFrom(
      this.authClient.send('auth.logout', { userId: req.user.userId }),
    );
  }
}