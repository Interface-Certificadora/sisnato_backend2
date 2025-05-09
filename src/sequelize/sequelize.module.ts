import { Global, Module } from '@nestjs/common';
import { Sequelize } from './sequelize';
import { FcwebProvider } from './providers/fcweb';

@Global()
@Module({
  providers: [Sequelize, FcwebProvider],
  exports: [Sequelize, FcwebProvider],
})
export class SequelizeModule {}
