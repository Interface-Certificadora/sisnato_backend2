import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FindAllPixQueryDto {
  @IsOptional()
  @IsString()
  txid?: string;

  @IsOptional()
  @IsString()
  forma_pagamento?: string;

  @IsOptional()
  @IsString()
  banco?: string;

  @IsOptional()
  @IsString()
  nomePagador?: string;

  @IsOptional()
  @IsString()
  documentoPagador?: string;

  @IsOptional()
  @IsDateString()
  dt_pg_from?: string;

  @IsOptional()
  @IsDateString()
  dt_pg_to?: string;

  @IsOptional()
  @IsNumber()
  valor_min?: number;

  @IsOptional()
  @IsNumber()
  valor_max?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'dt_pg', 'valor'])
  orderBy?: 'createdAt' | 'updatedAt' | 'dt_pg' | 'valor';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
