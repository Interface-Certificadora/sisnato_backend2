import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateChamadoDto {
  @ApiProperty({
    description: 'ID da solicitação',
    example: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'ID da solicitação deve ser um número válido' })
  @IsNotEmpty({ message: 'ID da solicitação não pode ser vazio' })
  solicitacao: number;

  @ApiProperty({
    description: 'Descrição do chamado',
    example: 'Descrição do chamado',
    type: String,
  })
  @IsString({ message: 'Descrição deve ser uma string válida' })
  @IsNotEmpty({ message: 'Descrição não pode ser vazia' })
  descricao: string;

  @ApiProperty({
    description:
      'Status do chamado, 0 = iniciado, 1 = em andamento, 2 = enviado para NL2, 3 = concluído, 4 = cancelado',
    example: 0,
  })
  @IsIn([0], {
    message: 'Para criar um chamado, o status deve ser do tipo Aberto',
  })
  @Type(() => Number)
  status: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Lista de imagens associadas ao chamado',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsOptional() 
  @ValidateIf((obj) => Array.isArray(obj.images)) 
  @IsArray({ message: 'images deve ser um array' })
  @ArrayNotEmpty({ message: 'images não pode ser um array vazio' })
  @IsString({ each: true, message: 'Cada item em images deve ser uma string' })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return value;
  })
  images?: string;
}
