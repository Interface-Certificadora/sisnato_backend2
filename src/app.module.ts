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
import { ChamadoModule } from './api/chamado/chamado.module';
import { RelatorioFinanceiroModule } from './api/relatorio_financeiro/relatorio_financeiro.module';
import { LogModule } from './log/log.module';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './sms/sms.module';
import { BugModule } from './api/bug/bug.module';
import { ChecktelModule } from './api/checktel/checktel.module';
import { DashboardModule } from './api/dashboard/dashboard.module';
import { DiretoModule } from './api/direto/direto.module';
import { DiretoTagsModule } from './api/direto-tags/direto-tags.module';
import { FichaModule } from './api/ficha/ficha.module';
import { FileModule } from './api/file/file.module';
import { NowModule } from './api/now/now.module';
import { GetInfosModule } from './api/get-infos/get-infos.module';
import { TagModule } from './api/tag/tag.module';
import { SequelizeModule } from './sequelize/sequelize.module';
import { PdfCreateModule } from './pdf_create/pdf_create.module';
import { SystemMessageModule } from './api/system_message/system_message.module';
import { PixModule } from './api/pix/pix.module';
import { RabbitnqModule } from './rabbitnq/rabbitnq.module';
import { ErrorModule } from './error/error.module';


@Module({
  imports: [
    AuthModule, // Mantido do primeiro trecho
    PrismaModule,
    S3Module,
    UserModule,
    SolicitacaoModule,
    ConstrutoraModule,
    FinanceiroModule,
    EmpreendimentoModule,
    AlertModule,
    SuporteModule,
    ChamadoModule,
    RelatorioFinanceiroModule,
    SmsModule,
    LogModule,
    BugModule,
    ChecktelModule,
    DashboardModule,
    DiretoModule,
    DiretoTagsModule,
    FichaModule,
    FileModule,
    NowModule,
    GetInfosModule,
    TagModule,
    SequelizeModule,
    PdfCreateModule,
    SystemMessageModule, // Adicionado do segundo trecho
    PixModule, RabbitnqModule, ErrorModule,

  ],
})
export class AppModule {}
