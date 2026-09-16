/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Fazer upload de um arquivo de mídia' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo a ser enviado',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de mídia (imagem, documento, etc.)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Arquivo enviado com sucesso e URL gerada.' })
  @ApiResponse({ status: 400, description: 'Nenhum arquivo enviado (file is required).' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const extension =
      file.originalname.split('.').pop()?.toLowerCase() ?? 'jpg';

    return firstValueFrom(
      this.mediaClient.send('upload_media', {
        buffer: file.buffer.toString('base64'),
        extension,
      }),
    );
  }
}