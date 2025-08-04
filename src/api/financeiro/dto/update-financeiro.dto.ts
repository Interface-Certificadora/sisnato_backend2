import { PartialType } from '@nestjs/mapped-types';
import { CreateFinanceiroDto } from './create-financeiro.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFinanceiroDto {
  @ApiProperty({
    description: 'Razão Social da Empresa',
    example: 'Nome da Empresa',
    type: String,
  })
  @IsOptional()
  razaosocial?: string;

  @ApiProperty({
    description: 'Telefone da Financeira',
    example: '999999999',
    type: String,
  })
  @IsString({ message: 'Telefone Deve Ser Uma String' })
  @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
  @IsOptional()
  tel?: string;

  @ApiProperty({
    description: 'Email da Financeira',
    example: 'johndoe@me.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({
    description: 'Responsavel da Financeira',
    example: 'Joh Doe',
    type: String,
  })
  @IsOptional()
  responsavel?: string;

  @ApiProperty({
    description: 'Fantasia da Financeira',
    example: 'TAG',
    type: String,
  })
  @IsOptional()
  fantasia?: string;

  @ApiProperty({
    description: 'Construtoras',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  construtoras?: number[];
}
