import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Financeiro {
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
  responsavel: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  tipo: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  obs: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  title: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  content: string;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  direto: boolean;

  @ApiResponseProperty({ type: Number })
  @Expose()
  valor_cert: number;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  Intelesign_status: boolean;

  @ApiResponseProperty({ type: Number })
  @Expose()
  Intelesign_price: number;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  status: boolean;

  @ApiResponseProperty({ type: Number })
  @Expose()
  responsavelId: number;

  @ApiResponseProperty({ type: Number })
  @Expose()
  empreendimentoId: number;

  @ApiResponseProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<Financeiro>) {
    Object.assign(this, partial);
  }
}
