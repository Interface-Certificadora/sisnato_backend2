import { ApiResponseProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { SolicitacaoEntity } from "src/api/solicitacao/entities/solicitacao.entity";

/**
 * Entity for Tag.
 * @class
 * @property {number} id - The id of the tag.
 * @property {number} solicitacao - The id of the solicitacao.
 * @property {string} descricao - The description of the tag.
 * @property {Date} createAt - The creation date of the tag.
 * @property {SolicitacaoEntity} solicitacaoData - The solicitacao data.
 */
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
