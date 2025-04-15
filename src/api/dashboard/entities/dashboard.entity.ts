import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Dashboard {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  constructor(partial: Partial<Dashboard>) {
    Object.assign(this, partial);
  }
}
