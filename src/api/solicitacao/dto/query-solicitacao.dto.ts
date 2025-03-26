import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QuerySolicitacaoDto {
  @IsOptional()
  nome: string;

  @IsOptional()
  andamento: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  construtora: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  empreendimento: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  financeiro: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  id: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  pagina: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  limite: string;
}
