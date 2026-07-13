import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dtos/send-message.dto';
import { EditMessageDto } from './dtos/edit-message.dto';
import { GetPaginatedMessagesDto } from './dtos/get-paginated-messages.dto';
import { GetLatestMessagesDto } from './dtos/get-latest-messages.dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.chatService.ping();
  }

  @EventPattern('chat.create')
  createChatForProject(@Payload() data: { project_id: string }) {
    return this.chatService.createChatForProject(data.project_id);
  }

  @MessagePattern('chat.message.send')
  sendMessage(@Payload() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @MessagePattern('chat.message.edit')
  editMessage(@Payload() dto: EditMessageDto) {
    return this.chatService.editMessage(dto);
  }

  @MessagePattern('chat.message.delete')
  deleteMessage(@Payload() data: { message_id: string; sender_id: string }) {
    return this.chatService.deleteMessage(data.message_id, data.sender_id);
  }

  @MessagePattern('chat.messages.paginated')
  getPaginatedMessages(@Payload() dto: GetPaginatedMessagesDto) {
    return this.chatService.getPaginatedMessages(dto);
  }

  @MessagePattern('chat.messages.latest')
  getLatestMessages(@Payload() dto: GetLatestMessagesDto) {
    return this.chatService.getLatestMessages(dto);
  }
}
