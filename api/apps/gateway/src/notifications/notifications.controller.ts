import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject('NOTIFICATIONS_CLIENT')
    private readonly notifClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getPaginated(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return firstValueFrom(
      this.notifClient.send('notifications.paginated', {
        user_id: req.user.userId,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread')
  async getUnread(@Req() req) {
    return firstValueFrom(
      this.notifClient.send('notifications.unread', {
        user_id: req.user.userId,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAllAsRead(@Req() req) {
    return firstValueFrom(
      this.notifClient.send('notifications.markAllAsRead', {
        user_id: req.user.userId,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Req() req, @Param('id') id: string) {
    return firstValueFrom(
      this.notifClient.send('notifications.markAsRead', {
        notification_id: id,
        user_id: req.user.userId,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteNotification(@Req() req, @Param('id') id: string) {
    return firstValueFrom(
      this.notifClient.send('notifications.delete', {
        notification_id: id,
        user_id: req.user.userId,
      }),
    );
  }
}
