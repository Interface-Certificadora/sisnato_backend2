import { Module } from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service';
import { SolicitacaoController } from './solicitacao.controller';

@Module({
  controllers: [SolicitacaoController],
  providers: [SolicitacaoService],
})
export class SolicitacaoModule {}
