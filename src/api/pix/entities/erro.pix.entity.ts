import { ApiResponseProperty } from '@nestjs/swagger';

export class ErrorPixType {
  @ApiResponseProperty({
    type: String,
  })
  message: string;
}
