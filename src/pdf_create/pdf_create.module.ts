import { Global, Module } from '@nestjs/common';
import { PdfCreateService } from './pdf_create.service';

@Global()
@Module({
  providers: [PdfCreateService],
  exports: [PdfCreateService],
})
export class PdfCreateModule {}
