import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MediaService } from './media.service';

interface UploadMediaPayload {
  buffer: string;
  extension: string;
}

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.mediaService.ping();
  }

  @MessagePattern('upload_media')
  upload(@Payload() payload: UploadMediaPayload) {
    return this.mediaService.upload(payload.buffer, payload.extension);
  }
}
