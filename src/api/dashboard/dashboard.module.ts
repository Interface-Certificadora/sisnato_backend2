import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UtilsService } from './utils/utils.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, UtilsService],
})
export class DashboardModule {}
