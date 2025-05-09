import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Chamado {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: Number })
  @Expose()
  solicitacao: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  descricao: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
  status: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  images: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  images_adm: string;

  @ApiResponseProperty({ type: Number })
  idUser: number;

  @ApiResponseProperty({ type: Number })
  @Expose()
  idResposta: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  resposta: string;

  @ApiResponseProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  updatedAt: Date;
}
