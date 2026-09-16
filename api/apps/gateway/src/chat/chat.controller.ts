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
import { ChatGateway } from './chat.gateway';
import { firstValueFrom } from 'rxjs';
import {
  SendMessageDto,
  EditMessageDto,
} from './dto/chatDto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    @Inject('CHAT_CLIENT') private readonly chatClient: ClientProxy,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Enviar uma nova mensagem no chat do projeto' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 201, description: 'Mensagem enviada e transmitida com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    const message = await firstValueFrom(
      this.chatClient.send('chat.message.send', {
        ...dto,
        sender_id: req.user.userId,
      }),
    );

    this.chatGateway.broadcastNewMessage(dto.project_id, message, req.user.userId);

    return message;
  }

  @Patch('edit')
  @ApiOperation({ summary: 'Editar uma mensagem existente' })
  @ApiBody({ type: EditMessageDto })
  @ApiResponse({ status: 200, description: 'Mensagem editada e atualizada via WebSocket com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async editMessage(@Req() req, @Body() dto: EditMessageDto) {
    const message = await firstValueFrom(
      this.chatClient.send('chat.message.edit', {
        ...dto,
        sender_id: req.user.userId,
      }),
    );

    this.chatGateway.broadcastEditMessage(message.project_id, message, req.user.userId);

    return message;
  }

  @Delete('message/:id')
  @ApiOperation({ summary: 'Deletar uma mensagem pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID da mensagem a ser deletada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Mensagem deletada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada.' })
  async deleteMessage(@Req() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.chatClient.send('chat.message.delete', {
        message_id: id,
        sender_id: req.user.userId,
      }),
    );

    this.chatGateway.broadcastDeleteMessage(result.project_id, id, req.user.userId);

    return result;
  }

  @Get('messages/:projectId')
  @ApiOperation({ summary: 'Buscar mensagens paginadas de um projeto' })
  @ApiParam({ name: 'projectId', description: 'UUID do projeto', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'limit', required: false, description: 'Quantidade máxima de mensagens', example: 20 })
  @ApiQuery({ name: 'offset', required: false, description: 'Deslocamento (offset) para paginação', example: 0 })
  @ApiResponse({ status: 200, description: 'Lista paginada de mensagens retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
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

  @Get('latest/:projectId')
  @ApiOperation({ summary: 'Buscar as últimas mensagens de um projeto' })
  @ApiParam({ name: 'projectId', description: 'UUID do projeto', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de mensagens recentes', example: 10 })
  @ApiResponse({ status: 200, description: 'Últimas mensagens retornadas com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
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

  @Get('voice/participants/:projectId')
  @ApiOperation({ summary: 'Listar participantes conectados no canal de voz do projeto' })
  @ApiParam({ name: 'projectId', description: 'UUID do projeto', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Lista de participantes de voz retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getVoiceParticipants(
    @Req() req,
    @Param('projectId') projectId: string,
  ) {
    const participants = await firstValueFrom(
      this.chatClient.send('chat.voice.participants', {
        project_id: projectId,
        sender_id: req.user.userId,
      }),
    );

    return {
      project_id: projectId,
      participants,
    };
  }
}