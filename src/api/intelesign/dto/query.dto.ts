import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @ApiProperty({
    name: 'page',
    default: 1,
    description: 'Numero da pagina ex 1',
    required: false,
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  page?: number;

  @ApiProperty({
    name: 'limit',
    description: 'Quantidade de registros por pagina ex 20',
    default: 20,
    required: false,
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  limit?: number;

  @ApiProperty({
    name: 'cca_id',
    description: 'ID da Financeira',
    required: false,
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  cca_id?: number;

  @ApiProperty({
    name: 'id do envelope',
    required: false,
    type: Number,
    description: 'ID do envelope',
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  id?: number;

  @ApiProperty({
    name: 'nome',
    required: false,
    type: String,
    description: 'Pesquisa pelo nome do signatário',
  })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({
    name: 'status',
    required: false,
    type: String,
    enum: [
      'done',
      'waiting',
      'in-transit',
      'signing',
      'rejected',
      'failed',
      'suspended',
    ],
    description: 'Status do envelope',
  })
  @IsString()
  @IsEnum(
    [
      'done',
      'waiting',
      'in-transit',
      'signing',
      'rejected',
      'failed',
      'suspended',
    ],
    {
      message:
        'Status inválido, deve ser: done, waiting, in-transit, signing, rejected, failed, suspended',
    },
  )
  @IsOptional()
  status?: string;

  @ApiProperty({
    name: 'data_inicio',
    required: false,
    type: String,
    description: 'Data de inicio da busca 2022-01-01',
  })
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  data_inicio?: string;

  @ApiProperty({
    name: 'data_fim',
    required: false,
    type: String,
    description: 'Data de fim da busca 2022-12-31',
  })
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  data_fim?: string;
}
