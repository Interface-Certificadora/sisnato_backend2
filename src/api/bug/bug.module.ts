import { Module } from '@nestjs/common';
import { BugService } from './bug.service';
import { BugController } from './bug.controller';

@Module({
  controllers: [BugController],
  providers: [BugService],
})
export class BugModule {}
