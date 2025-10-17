import { ApiProperty } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateConstrutoraDto {
  @ApiProperty({
    description: 'CNPJ da construtora',
    example: '00000000000100',
    type: String,
  })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
  cnpj: string;

  @ApiProperty({
    description: 'Razão social da construtora',
    example: 'Construtora A',
    type: String,
  })
  @IsNotEmpty({ message: 'Razão social é obrigatório' })
  @IsString({ message: 'Razão social deve ser uma string' })
  razaosocial: string;

  @ApiProperty({
    description: 'Nome fantasia da construtora',
    example: 'Construtora A',
    type: String,
  })
  @IsNotEmpty({ message: 'Nome fantasia é obrigatório' })
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  fantasia: string;

  @ApiProperty({
    description: 'Telefone da construtora',
    example: '0000000000',
    type: String,
  })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
  tel: string;

  @ApiProperty({
    description: 'E-mail da construtora',
    example: '0dMgM@example.com',
    type: String,
  })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsString({ message: 'E-mail deve ser uma string' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Valor do certificado',
    example: '1000',
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Valor do certificado deve ser um numero' })
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  valor_cert?: number;
}
