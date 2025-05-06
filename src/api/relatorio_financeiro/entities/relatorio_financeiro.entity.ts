import {
  IsDate,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { RelatorioFinanceiroConstrutora } from './relatorio_financeiro_contrutora.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RelatorioFinanceiro {
  @ApiProperty({
    description: 'ID do relatório',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Protocolo do relatório',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  protocolo: string;

  @ApiProperty({
    description: 'Valor total do relatório',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  valorTotal: number;

  @ApiProperty({
    description: 'Data de pagamento',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDate()
  dt_pg: Date;

  @ApiProperty({
    description: 'Situação do pagamento',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  situacao_pg: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDate()
  createAt: Date;

  @ApiProperty({
    description: 'Arquivo xlsx do relatório',
    example: 'relatorio.xlsx',
  })
  @IsOptional()
  @IsString()
  xlsx: string;

  @ApiProperty({
    description: 'Arquivo pdf do relatório',
    example: 'relatorio.pdf',
  })
  @IsOptional()
  @IsString()
  pdf: string;

  @ApiProperty({
    description: 'Construtora do relatório',
    example: {
      id: 1,
      fantasia: 'Construtora Teste',
      razaosocial: 'Construtora Teste',
    },
  })
  @IsObject()
  construtora: RelatorioFinanceiroConstrutora;

  constructor(partial: Partial<RelatorioFinanceiro>) {
    Object.assign(this, partial);
  }
}
