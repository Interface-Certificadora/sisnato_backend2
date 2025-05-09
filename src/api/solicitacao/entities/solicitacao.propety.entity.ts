import { ApiProperty } from '@nestjs/swagger';
import { SolicitacaoAll } from './solicitacao.all.entity';
import { IsNumber } from 'class-validator';

export class SolicitacaoAllEntity {
  @ApiProperty({ type: () => Number })
  @IsNumber()
  total: number;

  @ApiProperty({ type: () => [SolicitacaoAll] })
  data: SolicitacaoAll[];

  @ApiProperty({ type: () => Number })
  @IsNumber()
  pagina: number;

  @ApiProperty({ type: () => Number })
  @IsNumber()
  limite: number;
}
