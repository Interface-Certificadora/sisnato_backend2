import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmpreendimentoDto {
  @ApiProperty({
    description: 'Nome do empreendimento',
    example: 'Empreendimento A',
    type: String,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'ID da construtora',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'ID da construtora é obrigatório' })
  construtoraId: number;

  @ApiProperty({
    description: 'Estado do empreendimento',
    example: 'SP',
    type: String,
  })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @MaxLength(2, { message: 'Estado deve ter no máximo 2 caracteres' })
  estado: string;

  @ApiProperty({
    description: 'Cidade do empreendimento',
    example: 'São Paulo',
    type: String,
  })
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @MinLength(3, { message: 'Cidade inválida' })
  cidade: string;

  @ApiProperty({
    description: 'Ativo',
    example: true,
    type: Boolean,
  })
  @IsNotEmpty({ message: 'Ativo é obrigatório' })
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  status: boolean;

  @ApiPropertyOptional({
    description: 'Data de Inicio',
    example: '2020-01-01',
    type: String,
  })
  @IsOptional()
  datainicio?: string;

  @ApiPropertyOptional({
    description: 'Financeira',
    example: 1,
    type: [Number],
  })
  @IsOptional()
  financeiro?: [number];

  @ApiPropertyOptional({
    description: 'Vendedores',
    example: '1',
    type: String,
  })
  @IsOptional()
  vendedores?: string;

  @ApiPropertyOptional({
    description: 'Tag',
    example: 'TAG_',
    type: String,
  })
  @IsOptional()
  tag?: string;
}
