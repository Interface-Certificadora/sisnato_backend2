import { Test, TestingModule } from '@nestjs/testing';
import { BugService } from './bug.service';

describe('BugService', () => {
  let service: BugService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BugService],
    }).compile();

    service = module.get<BugService>(BugService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
