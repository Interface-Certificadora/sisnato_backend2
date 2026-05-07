import { IsOptional, IsString, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  construtoraId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  financeiroId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  corretorId?: number;
}
