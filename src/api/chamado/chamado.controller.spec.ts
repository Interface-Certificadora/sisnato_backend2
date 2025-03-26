import { Test, TestingModule } from '@nestjs/testing';
import { ChamadoController } from './chamado.controller';
import { ChamadoService } from './chamado.service';

describe('ChamadoController', () => {
  let controller: ChamadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChamadoController],
      providers: [ChamadoService],
    }).compile();

    controller = module.get<ChamadoController>(ChamadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
