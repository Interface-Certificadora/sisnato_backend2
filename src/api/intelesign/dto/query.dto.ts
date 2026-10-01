import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

/**
 * Mapeia o status escolhido no filtro para os states que a Intellisign
 * pode retornar e que ficam gravados em Intelesign.status
 */
export const STATUS_FILTRO_MAP: Record<string, string[]> = {
  done: ['done', 'completed'],
  waiting: ['new', 'draft', 'pending', 'waiting', 'in-transit'],
  'in-transit': ['in-transit'],
  signing: ['signing'],
  rejected: ['rejected'],
  expired: ['expired'],
  failed: ['failed'],
  suspended: ['suspended'],
};

const STATUS_FILTRO = Object.keys(STATUS_FILTRO_MAP);

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
    enum: STATUS_FILTRO,
    description: 'Status do envelope',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @IsIn(STATUS_FILTRO, {
    message: `Status inválido, deve ser: ${STATUS_FILTRO.join(', ')}`,
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    name: 'data_inicio',
    required: false,
    type: String,
    description: 'Data de inicio da busca (data de criação) 2022-01-01',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'data_inicio deve estar no formato YYYY-MM-DD',
  })
  @IsOptional()
  data_inicio?: string;

  @ApiProperty({
    name: 'data_fim',
    required: false,
    type: String,
    description: 'Data de fim da busca (data de criação) 2022-12-31',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'data_fim deve estar no formato YYYY-MM-DD',
  })
  @IsOptional()
  data_fim?: string;
}
