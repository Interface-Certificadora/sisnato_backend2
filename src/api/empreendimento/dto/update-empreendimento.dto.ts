import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

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
    example: 'São Paulo',
    type: String,
  })
  @IsOptional()
  @MinLength(3, { message: 'Cidade inválida' })
  cidade: string;

  @ApiPropertyOptional({
    description: 'Estado do empreendimento',
    example: 'SP',
    type: String,
  })
  @IsOptional()
  @MaxLength(2, { message: 'Estado deve ter no máximo 2 caracteres' })
  estado: string;

  @ApiPropertyOptional({
    description: 'Financeira',
    example: 1,
    type: [Number],
  })
  @IsOptional()
  financeiro?: [number];
}
