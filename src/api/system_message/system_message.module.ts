import { Module } from '@nestjs/common';
import { SystemMessageService } from './system_message.service';
import { SystemMessageController } from './system_message.controller';

@Module({
  controllers: [SystemMessageController],
  providers: [SystemMessageService],
})
export class SystemMessageModule {}
