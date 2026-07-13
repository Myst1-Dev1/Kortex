import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat.module';

@Module({
  imports: [
    ChatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URI,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
