import { Module } from '@nestjs/common';
import { ParceirosService } from './parceiros.service';
import { ParceirosController } from './parceiros.controller';

@Module({
  controllers: [ParceirosController],
  providers: [ParceirosService],
})
export class ParceirosModule {}
