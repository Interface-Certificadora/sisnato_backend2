import { Test, TestingModule } from '@nestjs/testing';
import { SystemMessageController } from './system_message.controller';
import { SystemMessageService } from './system_message.service';

describe('SystemMessageController', () => {
  let controller: SystemMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemMessageController],
      providers: [SystemMessageService],
    }).compile();

    controller = module.get<SystemMessageController>(SystemMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
