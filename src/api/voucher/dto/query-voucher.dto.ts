import { ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QueryVoucherDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limite?: number = 10;

  @ApiPropertyOptional({
    description: 'Status do Voucher',
    enum: VoucherStatus,
  })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @ApiPropertyOptional({ description: 'Código do Voucher (Busca parcial)' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({ description: 'Nome ou CPF do Cliente' })
  @IsOptional()
  @IsString()
  cliente?: string;
}
