import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MediaService } from './media.service';

interface UploadMediaPayload {
  buffer: string;
  extension: string;
}

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @MessagePattern('service.ping')
  ping() {
    return this.mediaService.ping();
  }

  @MessagePattern('media.uploadMedia')
  async handleUploadMedia(@Payload() data: { bufferBase64: string; extension: string }) {
    return this.mediaService.upload(data.bufferBase64, data.extension);
  }
}
