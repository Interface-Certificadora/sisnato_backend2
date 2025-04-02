import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetInfoTermos {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  termo: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  politica: string;

  @ApiResponseProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<GetInfoTermos>) {
    Object.assign(this, partial);
  }
}
