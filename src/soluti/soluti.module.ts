import { Module } from '@nestjs/common';
import { SolutiService } from './soluti.service';

@Module({
  providers: [SolutiService],
  exports: [SolutiService],
})
export class SolutiModule {}
