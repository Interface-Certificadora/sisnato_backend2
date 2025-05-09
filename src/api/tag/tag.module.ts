import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { SolicitacaoService } from '../solicitacao/solicitacao.service';

@Module({
  controllers: [TagController],
  providers: [TagService, SolicitacaoService],
})
export class TagModule {}
