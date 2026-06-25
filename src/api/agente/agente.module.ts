import { Module } from '@nestjs/common';
import { AgenteService } from './agente.service';
import { AgenteController } from './agente.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FcwebProvider } from '../../sequelize/providers/fcweb';
import { AgenteDisponibilidadeProvider } from '../../sequelize/providers/agente-disponibilidade.provider';
import { AgendamentoProvider } from '../../sequelize/providers/agendamento.provider';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from 'src/sequelize/sequelize.module';

@Module({
  imports: [PrismaModule, ConfigModule, SequelizeModule],
  controllers: [AgenteController],
  providers: [
    AgenteService,
    FcwebProvider,
    AgenteDisponibilidadeProvider,
    AgendamentoProvider,
  ],
})
export class AgenteModule {}
