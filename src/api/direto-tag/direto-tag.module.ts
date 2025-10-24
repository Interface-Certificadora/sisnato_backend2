import { Module } from '@nestjs/common';
import { DiretoTagService } from './direto-tag.service';
import { DiretoTagController } from './direto-tag.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogService } from 'src/log/log.service';
import { SolicitacaoService } from '../solicitacao/solicitacao.service';

@Module({
  controllers: [DiretoTagController],
  providers: [DiretoTagService, LogService, SolicitacaoService],
  imports: [PrismaModule],
})
export class DiretoTagModule {}
