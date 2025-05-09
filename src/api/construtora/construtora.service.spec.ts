import { Test, TestingModule } from '@nestjs/testing';
import { ConstrutoraService } from './construtora.service';

describe('ConstrutoraService', () => {
  let service: ConstrutoraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConstrutoraService],
    }).compile();

    service = module.get<ConstrutoraService>(ConstrutoraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
