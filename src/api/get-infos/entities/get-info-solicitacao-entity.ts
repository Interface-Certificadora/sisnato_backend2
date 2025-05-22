import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetInfoSolicitacaoEntity {
  @ApiResponseProperty({ type: Date })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: Date })
  @Expose()
  nome: string;

  constructor(partial: Partial<GetInfoSolicitacaoEntity>) {
    Object.assign(this, partial);
  }
}
