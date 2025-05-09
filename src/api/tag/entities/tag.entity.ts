import { ApiResponseProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { SolicitacaoEntity } from "src/api/solicitacao/entities/solicitacao.entity";

export class TagEntity {
  @ApiResponseProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiResponseProperty({ type: Number })
  @IsNumber()
  solicitacao: number;

  @ApiResponseProperty({ type: String })
  @IsString()
  descricao: string;

  @ApiResponseProperty({ type: Date })
  @IsDate()
  createAt: Date;

  @ApiResponseProperty({ type: SolicitacaoEntity })
  @IsOptional()
  solicitacaoData: SolicitacaoEntity

  /**
   * Create a new TagEntity from a partial object.
   * @param partial Partial TagEntity object.
   */
  constructor(partial: Partial<TagEntity>) {
    Object.assign(this, partial);
  }
}
