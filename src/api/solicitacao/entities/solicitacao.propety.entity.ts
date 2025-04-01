import { ApiProperty } from '@nestjs/swagger';
import { SolicitacaoAll } from './solicitacao.all.entity';

export class SolicitacaoProperty {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: () => [SolicitacaoAll] }) // 🔹 Define array de SolicitacaoAll
  data: SolicitacaoAll[];

  @ApiProperty()
  pagina: number;

  @ApiProperty()
  limite: number;
}
