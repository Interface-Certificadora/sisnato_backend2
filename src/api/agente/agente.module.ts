import { Module } from '@nestjs/common';
import { AgenteService } from './agente.service';
import { AgenteController } from './agente.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FcwebProvider } from '../../sequelize/providers/fcweb';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AgenteController],
  providers: [AgenteService, FcwebProvider],
})
export class AgenteModule {}
