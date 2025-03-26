import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QuerySolicitacaoDto {
  @ApiProperty({
    required: false,
    example: 'Solicitação 1',
    description: 'Parâmetro de busca por nome',
    type: String,
  })
  @IsOptional()
  nome: string;

  @ApiProperty({
    required: false,
    example: 'Concluído',
    description: 'Parâmetro de busca por andamento',
    type: String,
  })
  @IsOptional()
  andamento: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Parâmetro de busca por construtora',
    type: String,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  construtora: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Parâmetro de busca por empreendimento',
    type: String,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  empreendimento: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Parâmetro de busca por financeiro',
    type: String,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  financeiro: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Parâmetro de busca por id',
    type: String,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  id: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Parâmetro de busca por página',
    type: String,
  })
  // @Transform(({ value }) => Number(value))
  @IsOptional()
  pagina: number;

  @ApiProperty({
    required: false,
    example: '10',
    description: 'Parâmetro de busca por limite',
    type: String,
  })
  // @Transform(({ value }) => Number(value))
  @IsOptional()
  limite: string;
}
