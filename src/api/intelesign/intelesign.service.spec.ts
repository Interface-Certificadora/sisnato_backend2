import { Test, TestingModule } from '@nestjs/testing';
import { IntelesignService } from './intelesign.service';

describe('IntelesignService', () => {
  let service: IntelesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntelesignService],
    }).compile();

    service = module.get<IntelesignService>(IntelesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
