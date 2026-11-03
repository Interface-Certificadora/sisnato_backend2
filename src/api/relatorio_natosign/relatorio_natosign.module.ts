import { Module } from '@nestjs/common';
import { IntelesignModule } from '../intelesign/intelesign.module';
import { RelatorioNatosignController } from './relatorio_natosign.controller';
import { RelatorioNatosignService } from './relatorio_natosign.service';

@Module({
  imports: [IntelesignModule],
  controllers: [RelatorioNatosignController],
  providers: [RelatorioNatosignService],
})
export class RelatorioNatosignModule {}
