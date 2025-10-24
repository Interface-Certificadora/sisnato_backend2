import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class FilterInfosDto {
  @ApiProperty({
    description: 'ID da Construtora',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  construtoraId: number;

  @ApiProperty({
    description: 'ID do Empreendimento',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  empreendimentoId: number;

  @ApiProperty({
    description: 'ID do Financeiro',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  financeiroId: number;

  @ApiProperty({
    description: 'ID do Corretor',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  corretorId: number;

  constructor(partial: Partial<FilterInfosDto>) {
    Object.assign(this, partial);
  }
}
