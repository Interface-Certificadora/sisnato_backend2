import { Module } from '@nestjs/common';
import { DiretoService } from './direto.service';
import { DiretoClienteService } from './direto-cliente.service';
import { DiretoController } from './direto.controller';
import { PixModule } from '../pix/pix.module';

@Module({
  imports: [PixModule],
  controllers: [DiretoController],
  providers: [DiretoService, DiretoClienteService],
})
export class DiretoModule {}
