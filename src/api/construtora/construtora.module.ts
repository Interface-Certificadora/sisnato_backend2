import { Module } from '@nestjs/common';
import { ConstrutoraService } from './construtora.service';
import { ConstrutoraController } from './construtora.controller';

@Module({
  controllers: [ConstrutoraController],
  providers: [ConstrutoraService],
})
export class ConstrutoraModule {}
