import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

/**
 * Cobra os envelopes de UMA construtora ou de UMA CCA (nunca as duas).
 */
export class CreateRelatorioNatosignDto {
  @ApiProperty({
    example: 1,
    description: 'Id da Construtora (informe ela ou a CCA)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ConstrutoraId deve ser um número' })
  @IsPositive({ message: 'ConstrutoraId deve ser um número positivo' })
  ConstrutoraId?: number;

  @ApiProperty({
    example: 1,
    description: 'Id da CCA (informe ela ou a Construtora)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FinanceiroId deve ser um número' })
  @IsPositive({ message: 'FinanceiroId deve ser um número positivo' })
  FinanceiroId?: number;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de início (envio do envelope)',
    required: true,
  })
  @IsDateString({ strict: true }, { message: 'Inicio deve ser uma data' })
  @IsNotEmpty({ message: 'Data de início não pode ser vazia' })
  Inicio: string;

  @ApiProperty({
    example: '2025-01-31',
    description: 'Data de fim (envio do envelope)',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Fim deve ser uma data' })
  Fim?: string;
}
