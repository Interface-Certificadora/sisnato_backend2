import { Module } from '@nestjs/common';
import { NowService } from './now.service';
import { NowController } from './now.controller';

@Module({
  controllers: [NowController],
  providers: [NowService],
})
export class NowModule {}
