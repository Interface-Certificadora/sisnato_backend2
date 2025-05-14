import { Test, TestingModule } from '@nestjs/testing';
import { RabbitnqService } from './rabbitnq.service';

describe('RabbitnqService', () => {
  let service: RabbitnqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RabbitnqService],
    }).compile();

    service = module.get<RabbitnqService>(RabbitnqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
