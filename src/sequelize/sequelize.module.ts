import { Global, Module } from '@nestjs/common';
import { Sequelize } from './sequelize';
import { FcwebProvider } from './providers/fcweb';
import { FcwebReagendamentoProvider } from './providers/fcweb-reagendamento.provider';

@Global()
@Module({
  providers: [Sequelize, FcwebProvider, FcwebReagendamentoProvider],
  exports: [Sequelize, FcwebProvider, FcwebReagendamentoProvider],
})
export class SequelizeModule {}
