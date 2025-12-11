import { Test, TestingModule } from '@nestjs/testing';
import { ArParceiraService } from './ar-parceira.service';

describe('ArParceiraService', () => {
  let service: ArParceiraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArParceiraService],
    }).compile();

    service = module.get<ArParceiraService>(ArParceiraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
