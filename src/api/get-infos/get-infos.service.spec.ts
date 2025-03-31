import { Test, TestingModule } from '@nestjs/testing';
import { GetInfosService } from './get-infos.service';

describe('GetInfosService', () => {
  let service: GetInfosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetInfosService],
    }).compile();

    service = module.get<GetInfosService>(GetInfosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
