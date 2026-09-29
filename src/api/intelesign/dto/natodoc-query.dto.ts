import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class NatodocQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Número da página' })
  @Transform(({ value }) => Number(value) || 1)
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20, description: 'Registros por página' })
  @Transform(({ value }) => Math.min(Number(value) || 20, 100))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filtra por uma imobiliária específica (dentre as permitidas)',
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  imobiliaria_id?: number;

  @ApiPropertyOptional({
    description: 'Pesquisa pelo título do envelope ou nome do signatário',
  })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({
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
  @IsEnum([
    'done',
    'waiting',
    'in-transit',
    'signing',
    'rejected',
    'failed',
    'suspended',
  ])
  @IsOptional()
  status?: string;
}
