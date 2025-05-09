import { Test, TestingModule } from '@nestjs/testing';
import { ChecktelService } from './checktel.service';

describe('ChecktelService', () => {
  let service: ChecktelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChecktelService],
    }).compile();

    service = module.get<ChecktelService>(ChecktelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
