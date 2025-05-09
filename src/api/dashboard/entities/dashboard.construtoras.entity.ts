import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DashboardConstrutorasEntity {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  fantasia: string;

  constructor(partial: Partial<DashboardConstrutorasEntity>) {
    Object.assign(this, partial);
  }
}
