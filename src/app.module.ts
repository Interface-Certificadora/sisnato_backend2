import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
// import { SeModule } from './se/se.module';
import { S3Module } from './s3/s3.module';
import { UserModule } from './api/user/user.module';
import { SolicitacaoModule } from './api/solicitacao/solicitacao.module';
import { ConstrutoraModule } from './api/construtora/construtora.module';
import { FinanceiroModule } from './api/financeiro/financeiro.module';
import { EmpreendimentoModule } from './api/empreendimento/empreendimento.module';
import { AlertModule } from './api/alert/alert.module';
import { SuporteModule } from './api/suporte/suporte.module';
import { TagModule } from './api/tag/tag.module';
import { ChamadoModule } from './api/chamado/chamado.module';
import { RelatorioFinanceiroModule } from './api/relatorio_financeiro/relatorio_financeiro.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [PrismaModule, S3Module, UserModule, SolicitacaoModule, ConstrutoraModule, FinanceiroModule, EmpreendimentoModule, AlertModule, SuporteModule, TagModule, ChamadoModule, RelatorioFinanceiroModule, SmsModule],
})
export class AppModule {}
