import { Test, TestingModule } from '@nestjs/testing';
import { EmpreendimentoController } from './empreendimento.controller';
import { EmpreendimentoService } from './empreendimento.service';

describe('EmpreendimentoController', () => {
  let controller: EmpreendimentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpreendimentoController],
      providers: [EmpreendimentoService],
    }).compile();

    controller = module.get<EmpreendimentoController>(EmpreendimentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
