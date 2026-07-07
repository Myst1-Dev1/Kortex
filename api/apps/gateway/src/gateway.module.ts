import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [AuthModule, MediaModule, ProjectsModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
