import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { GatewayController } from './gateway.controller';

describe('GatewayController', () => {
  let gatewayController: GatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: 'AUTH_CLIENT',
          useValue: {
            send: jest.fn().mockReturnValue(
              of({
                ok: true,
                service: 'auth',
                now: '2026-01-01T00:00:00.000Z',
              }),
            ),
          },
        },
        {
          provide: 'MEDIA_CLIENT',
          useValue: {
            send: jest.fn().mockReturnValue(
              of({
                ok: true,
                service: 'media',
                now: '2026-01-01T00:00:00.000Z',
              }),
            ),
          },
        },
      ],
    }).compile();

    gatewayController = app.get<GatewayController>(GatewayController);
  });

  describe('health', () => {
    it('should aggregate gateway and service health', async () => {
      const result = await gatewayController.health();

      expect(result.ok).toBe(true);
      expect(result.gateway.service).toBe('gateway');
      expect(result.services.auth.ok).toBe(true);
      expect(result.services.media.ok).toBe(true);
    });
  });
});
