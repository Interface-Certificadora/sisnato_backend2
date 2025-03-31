import { Test, TestingModule } from '@nestjs/testing';
import { BugController } from './bug.controller';
import { BugService } from './bug.service';

describe('BugController', () => {
  let controller: BugController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BugController],
      providers: [BugService],
    }).compile();

    controller = module.get<BugController>(BugController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
