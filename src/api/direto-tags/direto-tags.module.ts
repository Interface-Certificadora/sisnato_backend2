import { Module } from '@nestjs/common';
import { DiretoTagsService } from './direto-tags.service';
import { DiretoTagsController } from './direto-tags.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiretoTagsController],
  providers: [DiretoTagsService],
})
export class DiretoTagsModule { }