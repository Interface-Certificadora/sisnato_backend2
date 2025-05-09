import { Test, TestingModule } from '@nestjs/testing';
import { PdfCreateService } from './pdf_create.service';

describe('PdfCreateService', () => {
  let service: PdfCreateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfCreateService],
    }).compile();

    service = module.get<PdfCreateService>(PdfCreateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
