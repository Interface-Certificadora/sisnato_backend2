import { Test, TestingModule } from '@nestjs/testing';
import { ArParceiraController } from './ar-parceira.controller';

describe('ArParceiraController', () => {
  let controller: ArParceiraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArParceiraController],
    }).compile();

    controller = module.get<ArParceiraController>(ArParceiraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
