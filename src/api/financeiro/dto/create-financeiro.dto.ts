import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class    CreateFinanceiroDto {
  @ApiProperty({
    description: 'CNPJ da Financeira',
    example: '12345678891234',
    type: String,
  })
  @IsNotEmpty({ message: 'O CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ Deve Ser Uma String' })
  @Length(14, 14, { message: 'O CNPJ deve conter 14 numeros' })
  cnpj: string;

  @ApiProperty({
    description: 'Razão Social da Empresa',
    example: 'Nome da Empresa',
    type: String,
  })
  @IsNotEmpty({ message: 'O Razão Social é obrigatório' })
  @IsString({ message: 'Razão Social Deve Ser Uma String' })
  razaosocial: string;

  @ApiPropertyOptional({
    description: 'Telefone da Financeira',
    example: '999999999',
    type: String,
  })
  @IsString({ message: 'Telefone Deve Ser Uma String' })
  @IsOptional()
  tel: string;

  @ApiPropertyOptional({
    description: 'Email da Financeira',
    example: 'johndoe@me.com',
    type: String,
  })
  @IsString({ message: 'Email Deve Ser Uma String' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'Responsavel da Financeira',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O Responsável é obrigatório' })
  responsavelId: number;

  @ApiPropertyOptional({
    description: 'Fantasia da Financeira',
    example: 'TAG',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Fantasia Deve Ser Uma String' })
  fantasia: string;

  @ApiProperty({
    description: 'Contrutoras da Financeira',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsNotEmpty({ message: 'As Contrutoras é obrigatórias' })
  construtoras: [number];
}
