import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SignatarioDto {
  @ApiProperty({
    description: 'Nome do signatário',
    example: 'Nome do signatário',
    required: true,
    type: () => String,
  })
  @Transform(({ value }) =>
    value
      .toUpperCase()
      .normalize('NFD')
      .replace(/[^\w\s]/g, ''),
  )
  @IsString({
    message: 'Nome do signatário deve ser uma string',
  })
  @IsNotEmpty({
    message: 'Nome do signatário é obrigatório',
  })
  nome: string;

  @ApiProperty({
    description: 'Email do signatário',
    example: 'email@exemplo.com',
    required: true,
    type: () => String,
  })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsString({
    message: 'Email do signatário deve ser uma string',
  })
  @IsNotEmpty({
    message: 'Email do signatário é obrigatório',
  })
  email: string;

  @ApiProperty({
    description: 'CPF do signatário',
    example: '12345678901',
    required: true,
    type: () => String,
  })
  @Transform(({ value }) => value.replace(/\D/g, '').trim())
  @IsString({
    message: 'CPF do signatário deve ser uma string',
  })
  @IsNotEmpty({
    message: 'CPF do signatário é obrigatório',
  })
  cpf: string;

  @ApiProperty({
    description:
      'Celular do signatário (com DDD). Quando informado, a Intellisign também notifica por WhatsApp',
    example: '16999999999',
    required: false,
    type: () => String,
  })
  @Transform(({ value }) =>
    value ? String(value).replace(/\D/g, '') : undefined,
  )
  @IsOptional()
  @IsString({
    message: 'Telefone do signatário deve ser uma string',
  })
  telefone?: string;

  @ApiProperty({
    description:
      'Qualificação do signatário no contrato (ex.: Testemunha, Representante da SPE). Sai no manifesto de assinaturas',
    example: 'Testemunha',
    required: false,
    type: () => String,
  })
  @Transform(({ value }) => (value ? String(value).trim() : undefined))
  @IsOptional()
  @IsString({
    message: 'Qualificação do signatário deve ser uma string',
  })
  @MaxLength(120, {
    message: 'Qualificação do signatário deve ter no máximo 120 caracteres',
  })
  qualificacao?: string;
}
