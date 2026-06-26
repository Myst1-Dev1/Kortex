import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let mediaController: MediaController;
  let mediaService: MediaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: {
            ping: jest.fn().mockReturnValue({
              ok: true,
              service: 'media',
              now: '2026-01-01T00:00:00.000Z',
            }),
            upload: jest.fn().mockResolvedValue({ url: 'https://example.com/image.jpg' }),
          },
        },
      ],
    }).compile();

    mediaController = app.get<MediaController>(MediaController);
    mediaService = app.get<MediaService>(MediaService);
  });

  describe('ping', () => {
    it('should return media health payload', () => {
      expect(mediaController.ping()).toEqual({
        ok: true,
        service: 'media',
        now: '2026-01-01T00:00:00.000Z',
      });
      expect(mediaService.ping).toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    it('should upload media and return url', async () => {
      const payload = { buffer: 'base64data', extension: 'jpg' };

      await expect(mediaController.upload(payload)).resolves.toEqual({
        url: 'https://example.com/image.jpg',
      });
      expect(mediaService.upload).toHaveBeenCalledWith('base64data', 'jpg');
    });
  });
});
