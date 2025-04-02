import { Test, TestingModule } from '@nestjs/testing';
import { BugController } from './bug.controller';
import { BugService } from './bug.service';

describe('BugController', () => {
  let bugcontroller: BugController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BugController],
      providers: [BugService],
    }).compile();

    bugcontroller = module.get<BugController>(BugController);
  });

  it('should be defined', () => {
    expect(bugcontroller).toBeDefined();
  });
});
