import { Test, TestingModule } from '@nestjs/testing';
import { DiretoTagsController } from './direto-tags.controller';
import { DiretoTagsService } from './direto-tags.service';

describe('DiretoTagsController', () => {
  let controller: DiretoTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiretoTagsController],
      providers: [DiretoTagsService],
    }).compile();

    controller = module.get<DiretoTagsController>(DiretoTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
