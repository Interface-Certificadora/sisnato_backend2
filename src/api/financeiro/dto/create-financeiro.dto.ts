import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateFinanceiroDto {
  @ApiProperty({
    description: 'CNPJ da Financeira',
    example: '12345678891234',
    type: String,
  })
  @IsNotEmpty({ message: 'O CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ Deve Ser Uma String' })
  @Length(14, 14, { message: 'O CNPJ deve conter 14 numeros' })
  @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
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
  @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
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
    example: 'John Doe',
    type: String,
  })
  @IsOptional({ message: 'O Responsável é obrigatório' })
  responsavel: string;

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
  construtoras: number[];

  @ApiPropertyOptional({
    description: 'Valor do Certificado',
    example: 87,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valor_cert: number;

  @ApiPropertyOptional({
    description: 'Direto',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  direto: boolean;

  @ApiPropertyOptional({
    description: 'Intelesign Status',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  Intelesign_status: boolean;

  @ApiPropertyOptional({
    description: 'Status Financeira',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status: boolean;

  @ApiPropertyOptional({
    description: 'Intelesign Price',
    example: 87,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  Intelesign_price: number;
}
