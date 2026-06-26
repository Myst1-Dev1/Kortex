import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
