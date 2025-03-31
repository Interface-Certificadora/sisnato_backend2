import { Module } from '@nestjs/common';
import { DiretoTagsService } from './direto-tags.service';
import { DiretoTagsController } from './direto-tags.controller';

@Module({
  controllers: [DiretoTagsController],
  providers: [DiretoTagsService],
})
export class DiretoTagsModule {}
