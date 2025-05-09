import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DashboardFinanceirasEntity {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  fantasia: string;
  constructor(partial: Partial<DashboardFinanceirasEntity>) {
    Object.assign(this, partial);
  }
}
