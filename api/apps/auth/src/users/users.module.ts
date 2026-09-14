import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, OAuthAccount } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, OAuthAccount])],
  providers: [],
  exports: [TypeOrmModule],
})
export class UsersModule {}

