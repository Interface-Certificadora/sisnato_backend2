import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getDashboardData(query);
  }

  @Get('ranking')
  async getRanking(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getRankingData(query);
  }
}
