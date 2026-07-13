import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';
import {
  SendMessageDto,
  EditMessageDto,
  GetPaginatedMessagesDto,
  GetLatestMessagesDto,
} from './dto/chatDto';

@Controller('chat')
export class ChatController {
  constructor(
    @Inject('CHAT_CLIENT') private readonly chatClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    return firstValueFrom(
      this.chatClient.send('chat.message.send', {
        ...dto,
        sender_id: req.user.userId,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit')
  async editMessage(@Req() req, @Body() dto: EditMessageDto) {
    return firstValueFrom(
      this.chatClient.send('chat.message.edit', {
        ...dto,
        sender_id: req.user.userId,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('message/:id')
  async deleteMessage(@Req() req, @Param('id') id: string) {
    return firstValueFrom(
      this.chatClient.send('chat.message.delete', {
        message_id: id,
        sender_id: req.user.userId,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:projectId')
  async getPaginatedMessages(
    @Req() req,
    @Param('projectId') projectId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return firstValueFrom(
      this.chatClient.send('chat.messages.paginated', {
        project_id: projectId,
        sender_id: req.user.userId,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest/:projectId')
  async getLatestMessages(
    @Req() req,
    @Param('projectId') projectId: string,
    @Query('limit') limit?: number,
  ) {
    return firstValueFrom(
      this.chatClient.send('chat.messages.latest', {
        project_id: projectId,
        sender_id: req.user.userId,
        limit: limit ? Number(limit) : undefined,
      }),
    );
  }
}
