import { Test, TestingModule } from '@nestjs/testing';
import { ChecktelController } from './checktel.controller';
import { ChecktelService } from './checktel.service';

describe('ChecktelController', () => {
  let controller: ChecktelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecktelController],
      providers: [ChecktelService],
    }).compile();

    controller = module.get<ChecktelController>(ChecktelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
