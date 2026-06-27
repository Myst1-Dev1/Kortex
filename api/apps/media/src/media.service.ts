/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  ping() {
    return {
      ok: true,
      service: 'media',
      now: new Date().toISOString(),
    };
  }

  async upload(bufferBase64: string, extension: string) {
    try {
      // Garante que extensões comuns como 'jpg' virem 'jpeg' se necessário
      let cleanExtension = extension.replace('.', '').toLowerCase();
      if (cleanExtension === 'jpg') cleanExtension = 'jpeg';

      // Remove espaços em branco ou quebras de linha invisíveis que quebram o decode
      const cleanBase64 = bufferBase64.replace(/\s/g, '');

      const result = await cloudinary.uploader.upload(
        `data:image/${cleanExtension};base64,${cleanBase64}`,
        { resource_type: 'image' },
      );

      return { url: result.secure_url };
    } catch (error: any) {
      // Exibe o erro real no console do microsserviço media para você debugar melhor
      console.error('Erro detalhado do Cloudinary:', error);

      throw new RpcException(
        error.message || 'Erro ao fazer upload no Cloudinary',
      );
    }
  }
}
