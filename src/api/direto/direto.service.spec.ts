import { Test, TestingModule } from '@nestjs/testing';
import { DiretoService } from './direto.service';

describe('DiretoService', () => {
  let service: DiretoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiretoService],
    }).compile();

    service = module.get<DiretoService>(DiretoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
