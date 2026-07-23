/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../libs/redis/src/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { RefreshTokenResponse, SignInResponse, SignUpResponse } from './interfaces/auth-interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  ping() {
    return {
      ok: true,
      service: 'auth',
      now: new Date().toISOString(),
    };
  }

  private sessionKey(userId: string) {
    return `auth:session:${userId}`;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
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

    await this.saveSession(user.id, {
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

    const passwordMatch = await compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const tokens = await this.generateTokens(user);

    await this.saveSession(user.id, {
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

    const session = await this.getSession(payload.sub);

    if (!session) {
      throw new UnauthorizedException('Sessão inválida');
    }

    if (session.refreshToken !== dto.refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const tokens = await this.generateTokens(user);

    await this.saveSession(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async saveSession(
    userId: string,
    data: Record<string, unknown>,
    ttlSeconds?: number,
  ) {
    const ttl =
      ttlSeconds ?? this.configService.get<number>('REDIS_DEFAULT_TTL', 604800);

    await this.redisService.set(this.sessionKey(userId), data, ttl);
  }

  async getSession(userId: string) {
    return this.redisService.get<Record<string, any>>(this.sessionKey(userId));
  }

  async revokeSession(userId: string) {
    await this.redisService.del(this.sessionKey(userId));
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
