import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Imobiliaria {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  cnpj: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  razaosocial: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  fantasia: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  tel: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  email: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  obs: string;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  status: boolean;

  @ApiResponseProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<Imobiliaria>) {
    Object.assign(this, partial);
  }
}

export class ErrorImobiliariaEntity {
  @ApiResponseProperty({ type: String })
  message: string;
}
