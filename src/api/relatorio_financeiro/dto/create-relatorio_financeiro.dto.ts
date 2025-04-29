import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsPositive } from "class-validator";

export class CreateRelatorioFinanceiroDto {
  @ApiProperty({
    example: 1,
    description: 'Id da Construtora',
    required: true,
  })
  @IsNumber({}, { message: 'ConstrutoraId deve ser um número' })
  @IsPositive({ message: 'ConstrutoraId deve ser um número positivo' })
  ConstrutoraId: number;

  @ApiProperty({
    example: 1,
    description: 'Id do Empreendimento',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'EmpreendimentoId deve ser um número' })
  @IsPositive({ message: 'EmpreendimentoId deve ser um número positivo' })
  EmpreendimentoId: number;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de inicio',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Inicio deve ser uma data' })
  Inicio: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de fim',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fim deve ser uma data' })
  Fim: string;

  @ApiProperty({
    example: 1,
    description: 'Id da Situacao',
    required: true,
  })
  @IsNumber({}, { message: 'SituacaoId deve ser um número' })
  SituacaoId: number;
}
