import { Test, TestingModule } from '@nestjs/testing';
import { RelatorioFinanceiroController } from './relatorio_financeiro.controller';
import { RelatorioFinanceiroService } from './relatorio_financeiro.service';

describe('RelatorioFinanceiroController', () => {
  let controller: RelatorioFinanceiroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelatorioFinanceiroController],
      providers: [RelatorioFinanceiroService],
    }).compile();

    controller = module.get<RelatorioFinanceiroController>(
      RelatorioFinanceiroController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
