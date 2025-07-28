import { ApiResponseProperty } from '@nestjs/swagger';

export class UserFinanceirasEntity {
  @ApiResponseProperty({ type: Number })
  id: number;
  @ApiResponseProperty({ type: String })
  fantasia: string;

  constructor(partial: Partial<UserFinanceirasEntity>) {
    Object.assign(this, partial);
  }
}
