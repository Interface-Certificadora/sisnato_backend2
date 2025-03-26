import { Module } from '@nestjs/common';
import { RelatorioFinanceiroService } from './relatorio_financeiro.service';
import { RelatorioFinanceiroController } from './relatorio_financeiro.controller';

@Module({
  controllers: [RelatorioFinanceiroController],
  providers: [RelatorioFinanceiroService],
})
export class RelatorioFinanceiroModule {}
