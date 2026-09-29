import { Module } from '@nestjs/common';
import { ImobiliariaService } from './imobiliaria.service';
import { ImobiliariaController } from './imobiliaria.controller';

@Module({
  controllers: [ImobiliariaController],
  providers: [ImobiliariaService],
})
export class ImobiliariaModule {}
