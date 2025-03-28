import { Test, TestingModule } from '@nestjs/testing';
import { DiretoController } from './direto.controller';
import { DiretoService } from './direto.service';

describe('DiretoController', () => {
  let controller: DiretoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiretoController],
      providers: [DiretoService],
    }).compile();

    controller = module.get<DiretoController>(DiretoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
