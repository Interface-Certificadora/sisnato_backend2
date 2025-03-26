import { ApiResponseProperty } from '@nestjs/swagger';

export class UserPayload {
  @ApiResponseProperty({ type: Number })
  id: number;

  @ApiResponseProperty({ type: String })
  nome: string;

  @ApiResponseProperty({ type: [Number] })
  construtora: [number];

  @ApiResponseProperty({ type: [Number] })
  empreendimento: [number];

  @ApiResponseProperty({ type: String })
  hierarquia: string;

  @ApiResponseProperty({ type: [Number] })
  Financeira: [number];
}
