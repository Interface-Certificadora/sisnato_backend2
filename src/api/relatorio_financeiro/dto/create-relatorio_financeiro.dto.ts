import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

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
    example: '2025-01-01',
    description: 'Data de inicio',
    required: false,
  })
  @IsDateString({ strict: true }, { message: 'Inicio deve ser uma data' })
  @IsNotEmpty({ message: 'Data de início não pode ser vazia' })
  Inicio: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de fim',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Fim deve ser uma data' })
  Fim: string;
}
