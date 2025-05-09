import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoService } from './solicitacao.service';

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitacaoService],
    }).compile();

    service = module.get<SolicitacaoService>(SolicitacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
