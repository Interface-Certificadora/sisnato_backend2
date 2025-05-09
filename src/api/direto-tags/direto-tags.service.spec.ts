import { Test, TestingModule } from '@nestjs/testing';
import { DiretoTagsService } from './direto-tags.service';

describe('DiretoTagsService', () => {
  let service: DiretoTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiretoTagsService],
    }).compile();

    service = module.get<DiretoTagsService>(DiretoTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
