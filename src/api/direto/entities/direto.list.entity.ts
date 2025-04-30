import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class AllDireto {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  nome: string;

  @ApiResponseProperty({ type: Date })
  @Expose()
  dt_agendamento: Date;

  @ApiResponseProperty({ type: String })
  @Expose()
  andamento: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  type_validacao: string;

  @ApiResponseProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  updatedAt: Date;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  distrato: boolean;

  @ApiResponseProperty({ type: Date })
  @Expose()
  dt_aprovacao: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  hr_aprovacao: Date;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  ativo: boolean;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  alertnow: boolean;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  pause: boolean;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  statusAtendimento: boolean;

  constructor(partial: Partial<AllDireto>) {
    Object.assign(this, partial);
  }
}
