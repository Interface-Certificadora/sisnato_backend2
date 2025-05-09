import { Test, TestingModule } from '@nestjs/testing';
import { RelatorioFinanceiroService } from './relatorio_financeiro.service';

describe('RelatorioFinanceiroService', () => {
  let service: RelatorioFinanceiroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelatorioFinanceiroService],
    }).compile();

    service = module.get<RelatorioFinanceiroService>(RelatorioFinanceiroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
