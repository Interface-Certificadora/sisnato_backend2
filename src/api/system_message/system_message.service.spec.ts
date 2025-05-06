import { Test, TestingModule } from '@nestjs/testing';
import { SystemMessageService } from './system_message.service';

describe('SystemMessageService', () => {
  let service: SystemMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemMessageService],
    }).compile();

    service = module.get<SystemMessageService>(SystemMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
