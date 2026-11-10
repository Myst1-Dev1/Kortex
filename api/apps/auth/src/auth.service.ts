/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, OAuthAccount } from './users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import {
  OAuthSignInPayload,
  RefreshTokenResponse,
  SignInResponse,
  SignUpResponse,
} from './interfaces/auth-interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(OAuthAccount)
    private readonly oauthAccountRepository: Repository<OAuthAccount>,
  ) { }

  ping() {
    return {
      ok: true,
      service: 'auth',
      now: new Date().toISOString(),
    };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(dto: SignUpResponse) {
    const userAlreadyExists = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException('Usuário já existe');
    }

    const hashedPassword = await hash(dto.password, 10);

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      avatarUrl: dto.avatarUrl,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    await this.userRepository.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user,
      ...tokens,
    };
  }

  async signIn(dto: SignInResponse) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Esta conta foi criada com login social (Google ou GitHub). Faça login através do seu provedor.',
      );
    }

    const passwordMatch = await compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const tokens = await this.generateTokens(user);

    await this.userRepository.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user,
      ...tokens,
    };
  }

  async oauthSignIn(dto: OAuthSignInPayload) {
    if (!dto.emailVerified) {
      throw new UnauthorizedException(
        'O e-mail precisa estar verificado pelo provedor OAuth para realizar login.',
      );
    }

    // 1. Procurar por vínculo OAuth já existente
    const existingOAuth = await this.oauthAccountRepository.findOne({
      where: {
        provider: dto.provider,
        providerAccountId: dto.providerAccountId,
      },
      relations: { user: true },
    });

    let user: User;

    if (existingOAuth) {
      user = existingOAuth.user;

      let hasUpdates = false;
      if (!user.avatarUrl && dto.avatarUrl) {
        user.avatarUrl = dto.avatarUrl;
        hasUpdates = true;
      }
      if (!user.name && dto.name) {
        user.name = dto.name;
        hasUpdates = true;
      }
      if (hasUpdates) {
        await this.userRepository.save(user);
      }
    } else {
      // 2. Procurar se já existe usuário cadastrado com este e-mail
      const email = dto.email.toLowerCase().trim();
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        user = existingUser;

        if (!user.avatarUrl && dto.avatarUrl) {
          user.avatarUrl = dto.avatarUrl;
          await this.userRepository.save(user);
        }
      } else {
        // 3. Criar novo usuário via OAuth
        const newUser = this.userRepository.create({
          name: dto.name || email.split('@')[0],
          email,
          password: null,
          avatarUrl: dto.avatarUrl || null,
        });

        user = await this.userRepository.save(newUser);
      }

      // Criar o registro do vínculo OAuth
      const oauthAccount = this.oauthAccountRepository.create({
        provider: dto.provider,
        providerAccountId: dto.providerAccountId,
        userId: user.id,
      });

      await this.oauthAccountRepository.save(oauthAccount);
    }

    const tokens = await this.generateTokens(user);

    await this.userRepository.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenResponse) {
    const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Sessão inválida');
    }

    if (user.refreshToken !== dto.refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokens = await this.generateTokens(user);

    await this.userRepository.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async revokeSession(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async validateToken(userId: string): Promise<boolean> {
    return this.userRepository.existsBy({ id: userId });
  }

  async findUsersByIds(ids: string[]) {
    if (!ids.length) return [];

    const users = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email', 'user.avatarUrl'])
      .where('user.id IN (:...ids)', { ids })
      .getMany();

    return users;
  }
}
