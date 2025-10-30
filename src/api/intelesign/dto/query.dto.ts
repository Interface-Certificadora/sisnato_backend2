import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
    description:
      'ID ou IDs da Financeira (CCA). Pode ser único (?cca_id=1), múltiplo (?cca_id=1&cca_id=2) ou separado por vírgula (?cca_id=1,2,3)',
    required: false,
    type: [Number],
  })
  @Transform(({ value }) => {
    if (value === '') {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value.filter((v) => v !== '').map((v) => Number(v));
    }

    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value.split(',').map((v) => Number(v.trim()));
      }
      return [Number(value)]; // '1' -> [1]
    }

    if (typeof value === 'number') {
      return [value];
    }
    return value;
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  cca_id?: number[];

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
