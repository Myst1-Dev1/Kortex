import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { ProjectsModule } from './projects/projects.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, MediaModule, ProjectsModule, TasksModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
