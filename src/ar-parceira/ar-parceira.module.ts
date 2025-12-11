import { Module } from '@nestjs/common';
import { ArParceiraController } from './ar-parceira.controller';
import { ArParceiraService } from './ar-parceira.service';

@Module({
  controllers: [ArParceiraController],
  providers: [ArParceiraService]
})
export class ArParceiraModule {}
