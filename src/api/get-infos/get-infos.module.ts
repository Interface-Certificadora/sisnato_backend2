import { Module } from '@nestjs/common';
import { GetInfosService } from './get-infos.service';
import { GetInfosController } from './get-infos.controller';

@Module({
  controllers: [GetInfosController],
  providers: [GetInfosService],
})
export class GetInfosModule {}
