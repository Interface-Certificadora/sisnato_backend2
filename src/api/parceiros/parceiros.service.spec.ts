import { Test, TestingModule } from '@nestjs/testing';
import { ParceirosService } from './parceiros.service';

describe('ParceirosService', () => {
  let service: ParceirosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParceirosService],
    }).compile();

    service = module.get<ParceirosService>(ParceirosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
