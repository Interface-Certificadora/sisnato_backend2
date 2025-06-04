import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Descrição da tag',
    example: 'Descrição da tag',
    type: String,
    required: true,
  })
  @IsString({ message: 'Descrição da tag deve ser uma string válida' })
  @IsNotEmpty({ message: 'Descrição da tag não pode ser vazia' })
  descricao: string;

  @ApiProperty({
    description: 'ID da solicitação',
    example: 1,
    type: Number,
    required: true,
  })
  @IsNotEmpty({ message: 'ID da solicitação não pode ser vazio' })
  @IsNotIn([0, null], { message: 'ID da solicitação não pode ser 0 ou null' })
  @IsNumber({}, { message: 'ID da solicitação deve ser um número válido' })
  @IsPositive({ message: 'ID da solicitação deve ser um número válido' })
  solicitacao: number;
}
