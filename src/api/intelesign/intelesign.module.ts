import { Module } from '@nestjs/common';
import { IntelesignService } from './intelesign.service';
import { IntelesignController } from './intelesign.controller';

@Module({
  controllers: [IntelesignController],
  providers: [IntelesignService],
  exports: [IntelesignService],
})
export class IntelesignModule {}
