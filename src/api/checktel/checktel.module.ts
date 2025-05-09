import { Module } from '@nestjs/common';
import { ChecktelService } from './checktel.service';
import { ChecktelController } from './checktel.controller';

@Module({
  controllers: [ChecktelController],
  providers: [ChecktelService],
})
export class ChecktelModule {}
