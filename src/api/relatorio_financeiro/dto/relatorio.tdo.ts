import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, IsNotIn, IsNumber, IsString } from "class-validator";


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
  @IsString({ message: 'Data de início deve ser uma string' })
  @IsNotEmpty({ message: 'Data de início não pode ser vazia' })
  Inicio: string;

  @ApiProperty({
    example: '2025-04-14',
    description: 'Data de fim',
    required: true,
  })
  @IsString({ message: 'Data de fim deve ser uma string' })
  Fim: string;

  @ApiProperty({
    example: 1,
    description: 'ID da Situação',
    required: true,
  })
  @IsInt({ message: 'ID da Situação deve ser um número' })
  @IsIn([0,1,2], { message: 'ID da Situação deve ser 0, 1 ou 2' })
  SituacaoId: number;
}