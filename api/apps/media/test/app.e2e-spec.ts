import { Test, TestingModule } from '@nestjs/testing';
import { MediaModule } from './../src/media.module';
import { MediaService } from './../src/media.service';

describe('MediaModule (e2e)', () => {
  let mediaService: MediaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MediaModule],
    }).compile();

    mediaService = moduleFixture.get<MediaService>(MediaService);
  });

  it('ping returns service metadata', () => {
    const result = mediaService.ping();

    expect(result.ok).toBe(true);
    expect(result.service).toBe('media');
    expect(result.now).toBeDefined();
  });
});
