import { Module } from '@nestjs/common';
import { TagListService } from './tag-list.service';
import { TagListController } from './tag-list.controller';

@Module({
  controllers: [TagListController],
  providers: [TagListService],
})
export class TagListModule {}
