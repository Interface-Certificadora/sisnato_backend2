import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { SolicitacaoModule } from '../solicitacao/solicitacao.module'; // Importar o módulo
import { LogModule } from 'src/log/log.module'; // Assumindo que LogModule existe e exporta LogService

@Module({
  imports: [SolicitacaoModule, LogModule], // Adicionar módulos importados
  controllers: [TagController],
  providers: [TagService], // Remover SolicitacaoService daqui
})
export class TagModule {}
