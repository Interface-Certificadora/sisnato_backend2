import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FiltroDashboardDto {
  @ApiProperty({
    example: '2022-01-01',
    description: 'Data de início',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  dataInicio?: Date;

  @ApiProperty({
    example: '2022-01-01',
    description: 'Data de fim',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  dataFim?: Date;

  @ApiProperty({
    example: '1',
    description: 'ID da Construtora',
    required: true,
  })
  @IsNotEmpty({ message: 'ID da construtora é obrigatório' })
  @Transform(({ value }) => Number(value))
  construtora: number;

  @ApiProperty({
    example: '1',
    description: 'ID do Empreendimento',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  empreedimento?: number;

  @ApiProperty({
    example: '1',
    description: 'ID do Financeiro',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  financeiro?: number;
}
