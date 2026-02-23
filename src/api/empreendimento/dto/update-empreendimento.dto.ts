import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateEmpreendimentoDto {
  @ApiPropertyOptional({
    description: 'ID da construtora',
    example: 1,
    type: Number,
  })
  @IsOptional()
  construtoraId: number;

  @ApiPropertyOptional({
    description: 'Nome do empreendimento',
    example: 'Empreendimento A',
    type: String,
  })
  @IsOptional()
  nome: string;

  @ApiPropertyOptional({
    description: 'Cidade do empreendimento',
    example: 'São Paulo',
    type: String,
  })
  @IsOptional()
  @MinLength(3, { message: 'Cidade inválida' })
  @Transform(({ value }) =>
    value
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim(),
  )
  cidade: string;

  @ApiPropertyOptional({
    description: 'Estado do empreendimento',
    example: 'SP',
    type: String,
  })
  @IsOptional()
  @MaxLength(2, { message: 'Estado deve ter no máximo 2 caracteres' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  estado: string;

  @ApiPropertyOptional({
    description: 'Financeira',
    example: 1,
    type: [Number],
  })
  @IsOptional()
  financeiro?: number[];

  @ApiPropertyOptional({
    description: 'Direto',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  direto?: boolean;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ValidateIf((o) => o.valor_cert !== null)
  valor_cert?: number | null;

  constructor(partial?: Partial<UpdateEmpreendimentoDto>) {
    Object.assign(this, partial);
  }
}
