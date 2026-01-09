import { Test, TestingModule } from '@nestjs/testing';
import { SolutiService } from './soluti.service';

describe('SolutiService', () => {
  let service: SolutiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolutiService],
    }).compile();

    service = module.get<SolutiService>(SolutiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
