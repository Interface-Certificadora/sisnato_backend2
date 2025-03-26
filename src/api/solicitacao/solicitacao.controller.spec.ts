import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';

describe('SolicitacaoController', () => {
  let controller: SolicitacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitacaoController],
      providers: [SolicitacaoService],
    }).compile();

    controller = module.get<SolicitacaoController>(SolicitacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
