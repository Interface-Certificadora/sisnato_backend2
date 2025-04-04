import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Now {
  @ApiResponseProperty({ type: Boolean })
  @Expose()
  alertanow: boolean;
}
