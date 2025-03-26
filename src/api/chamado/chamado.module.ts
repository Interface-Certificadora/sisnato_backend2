import { Module } from '@nestjs/common';
import { ChamadoService } from './chamado.service';
import { ChamadoController } from './chamado.controller';

@Module({
  controllers: [ChamadoController],
  providers: [ChamadoService],
})
export class ChamadoModule {}
