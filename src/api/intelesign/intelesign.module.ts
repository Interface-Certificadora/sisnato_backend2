import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IntelesignService } from './intelesign.service';
import { IntelesignController } from './intelesign.controller';

@Module({
  imports: [PrismaModule],
  controllers: [IntelesignController],
  providers: [IntelesignService],
  exports: [IntelesignService]
})
export class IntelesignModule {}
