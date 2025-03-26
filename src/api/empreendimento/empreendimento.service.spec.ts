import { Test, TestingModule } from '@nestjs/testing';
import { EmpreendimentoService } from './empreendimento.service';

describe('EmpreendimentoService', () => {
  let service: EmpreendimentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpreendimentoService],
    }).compile();

    service = module.get<EmpreendimentoService>(EmpreendimentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
