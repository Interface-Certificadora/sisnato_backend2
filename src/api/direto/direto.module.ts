import { Module } from '@nestjs/common';
import { DiretoService } from './direto.service';
import { DiretoController } from './direto.controller';

@Module({
  controllers: [DiretoController],
  providers: [DiretoService],
})
export class DiretoModule {}
