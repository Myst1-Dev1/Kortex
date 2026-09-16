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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject('NOTIFICATIONS_CLIENT')
    private readonly notifClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Buscar notificações paginadas do usuário' })
  @ApiQuery({ name: 'limit', required: false, description: 'Quantidade máxima de registros', example: 10 })
  @ApiQuery({ name: 'offset', required: false, description: 'Deslocamento (offset) para paginação', example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de notificações paginada retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
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

  @Get('unread')
  @ApiOperation({ summary: 'Buscar notificações não lidas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de notificações não lidas retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getUnread(@Req() req) {
    return firstValueFrom(
      this.notifClient.send('notifications.unread', {
        user_id: req.user.userId,
      }),
    );
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações do usuário como lidas' })
  @ApiResponse({ status: 200, description: 'Todas as notificações foram marcadas como lidas.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async markAllAsRead(@Req() req) {
    return firstValueFrom(
      this.notifClient.send('notifications.markAllAsRead', {
        user_id: req.user.userId,
      }),
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar uma notificação específica como lida' })
  @ApiParam({ name: 'id', description: 'ID único da notificação', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada.' })
  async markAsRead(@Req() req, @Param('id') id: string) {
    return firstValueFrom(
      this.notifClient.send('notifications.markAsRead', {
        notification_id: id,
        user_id: req.user.userId,
      }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma notificação específica' })
  @ApiParam({ name: 'id', description: 'ID único da notificação', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Notificação deletada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada.' })
  async deleteNotification(@Req() req, @Param('id') id: string) {
    return firstValueFrom(
      this.notifClient.send('notifications.delete', {
        notification_id: id,
        user_id: req.user.userId,
      }),
    );
  }
}