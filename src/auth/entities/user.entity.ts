import { ApiResponseProperty } from '@nestjs/swagger';
import { UseRole } from './useRole.entity';

export class UserPayload {
  @ApiResponseProperty({ type: Number })
  id: number;

  @ApiResponseProperty({ type: String })
  nome: string;

  @ApiResponseProperty({ type: [Number] })
  construtora: number[];

  @ApiResponseProperty({ type: [Number] })
  empreendimento: number[];

  @ApiResponseProperty({ type: String })
  hierarquia: string;

  @ApiResponseProperty({ type: [Number] })
  Financeira: number[];

  @ApiResponseProperty({ type: UseRole })
  role: UseRole;

  constructor(partial: Partial<UserPayload>) {
    Object.assign(this, partial);
  }
}

