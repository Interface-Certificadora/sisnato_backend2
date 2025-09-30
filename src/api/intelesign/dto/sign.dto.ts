import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignatarioDto {
  @ApiProperty({
    description: 'Nome do signatário',
    example: 'Nome do signatário',
    required: true,
    type: () => String,
  })
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
  @IsString({
    message: 'CPF do signatário deve ser uma string',
  })
  @IsNotEmpty({
    message: 'CPF do signatário é obrigatório',
  })
  cpf: string;
}
