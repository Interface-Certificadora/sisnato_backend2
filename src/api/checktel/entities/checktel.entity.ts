import { ApiResponseProperty } from '@nestjs/swagger';

export class Checktel {
  @ApiResponseProperty({ type: Boolean })
  exists: boolean;
}
