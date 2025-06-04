import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateRelatorioDto {
  @ApiProperty({
    example: 1,
    description: 'ID da Construtora',
    required: true,
  })
  @IsInt({ message: 'ID da Construtora deve ser um número' })
  @IsNotIn([0], { message: 'ID da Construtora não pode ser 0' })
  ConstrutoraId: number;

  @ApiProperty({
    example: '2025-03-07',
    description: 'Data de início',
    required: true,
  })
  @IsDateString(
    { strict: true },
    { message: 'Data de início deve ser uma string' },
  )
  @IsNotEmpty({ message: 'Data de início não pode ser vazia' })
  Inicio: string;

  @ApiProperty({
    example: '2025-04-14',
    description: 'Data de fim',
    required: true,
  })
  @IsDateString(
    { strict: true },
    { message: 'Data de fim deve ser uma string' },
  )
  Fim: string;
}
