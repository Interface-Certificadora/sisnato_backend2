import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRelatorioFinanceiroDto {
  @ApiProperty({
    example: '12345',
    description: 'Protocolo do relatório',
    required: false,
  })
  @IsString({ message: 'Protocolo deve ser uma string' })
  @IsOptional()
  protocolo?: string;

  @ApiProperty({
    example: 1,
    description: 'Id da Situacao',
    required: false,
  })
  @IsNumber({}, { message: 'SituacaoId deve ser um número' })
  @IsOptional()
  situacao_pg?: number;

  @ApiProperty({
    example: '12345',
    description: 'Nota fiscal',
    required: false,
  })
  @IsString({ message: 'Nota fiscal deve ser uma string' })
  @IsOptional()
  nota_fiscal?: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de inicio',
    required: false,
  })
  @IsDateString({}, { message: 'Inicio deve ser uma data' })
  @IsOptional()
  start?: Date;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de fim',
    required: false,
  })
  @IsDateString({}, { message: 'Fim deve ser uma data' })
  @IsOptional()
  end?: Date;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de pagamento',
    required: false,
  })
  @IsDateString({}, { message: 'Data de pagamento deve ser uma data' })
  @IsOptional()
  dt_pg?: Date;

  @ApiProperty({
    example: true,
    description: 'Status da nota',
    required: false,
  })
  @IsBoolean({ message: 'Status da nota deve ser um boolean' })
  @IsOptional()
  statusNota?: boolean;

  @ApiProperty({
    example: 1000,
    description: 'Total de certidões',
    required: false,
  })
  @IsNumber({}, { message: 'Total de certidões deve ser um número' })
  @IsOptional()
  total_cert?: number;

  @ApiProperty({
    example: 1000,
    description: 'Valor total',
    required: false,
  })
  @IsNumber({}, { message: 'Valor total deve ser um número' })
  @IsOptional()
  valorTotal?: number;

  @ApiProperty({
    example: '[{"id": 1, "nome": "Solicitacao 1"}]',
    description: 'Json de solicitacoes',
    required: false,
  })
  @IsArray({ message: 'Json de solicitacoes deve ser um array' })
  @IsOptional()
  solicitacaoJson?: Array<any>;

  @ApiProperty({
    example: 'https://example.com/pdf.pdf',
    description: 'Pdf do relatório',
    required: false,
  })
  @IsString({ message: 'Pdf do relatório deve ser uma string' })
  @IsOptional()
  pdf?: string;

  @ApiProperty({
    example: 'https://example.com/xlsx.xlsx',
    description: 'Xlsx do relatório',
    required: false,
  })
  @IsString({ message: 'Xlsx do relatório deve ser uma string' })
  @IsOptional()
  xlsx?: string;

  @ApiProperty({
    example: 'modelo',
    description: 'Modelo do relatório',
    required: false,
  })
  @IsString({ message: 'Modelo do relatório deve ser uma string' })
  @IsOptional()
  modelo?: string;
}
