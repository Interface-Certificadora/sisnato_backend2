import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DashboardEmpreendimentoEntity {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  nome: string;

  constructor(partial: Partial<DashboardEmpreendimentoEntity>) {
    Object.assign(this, partial);
  }
}
