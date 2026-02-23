import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer'; // Importe o Transform
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateEmpreendimentoDto {
  @ApiProperty({
    description: 'Nome do empreendimento',
    example: 'Empreendimento A',
    type: String,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'ID da construtora',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'ID da construtora é obrigatório' })
  construtoraId: number;

  @ApiProperty({
    description: 'Estado do empreendimento',
    example: 'SP',
    type: String,
  })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @MaxLength(2, { message: 'Estado deve ter no máximo 2 caracteres' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  estado: string;

  @ApiProperty({
    description: 'Cidade do empreendimento',
    example: 'São Paulo',
    type: String,
  })
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @MinLength(3, { message: 'Cidade inválida' })
  @Transform(({ value }) =>
    value
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim(),
  )
  cidade: string;

  @ApiProperty({
    description: 'Ativo',
    example: true,
    type: Boolean,
  })
  @IsNotEmpty({ message: 'Ativo é obrigatório' })
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  status: boolean;

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
  @IsBoolean({ message: 'Direto deve ser um booleano' })
  direto?: boolean;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ValidateIf((o) => o.valor_cert !== null)
  valor_cert?: number | null;

  constructor(partial?: Partial<CreateEmpreendimentoDto>) {
    Object.assign(this, partial);
  }
}
