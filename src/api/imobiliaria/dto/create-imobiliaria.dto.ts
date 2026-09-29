import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateImobiliariaDto {
  @ApiProperty({
    description: 'CNPJ da imobiliária',
    example: '00000000000100',
    type: String,
  })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Transform(({ value }) => value.replace(/[^0-9]/g, ''))
  cnpj: string;

  @ApiProperty({
    description: 'Razão social da imobiliária',
    example: 'Imobiliária A',
    type: String,
  })
  @IsNotEmpty({ message: 'Razão social é obrigatório' })
  @IsString({ message: 'Razão social deve ser uma string' })
  razaosocial: string;

  @ApiProperty({
    description: 'Nome fantasia da imobiliária',
    example: 'Imobiliária A',
    type: String,
  })
  @IsNotEmpty({ message: 'Nome fantasia é obrigatório' })
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  fantasia: string;

  @ApiPropertyOptional({
    description: 'Telefone da imobiliária',
    example: '0000000000',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  tel?: string;

  @ApiPropertyOptional({
    description: 'E-mail da imobiliária',
    example: 'contato@imobiliaria.com',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'E-mail deve ser uma string' })
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: 'Observações',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  obs?: string;
}
