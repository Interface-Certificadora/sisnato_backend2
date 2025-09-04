import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateDiretoDto {
  @ApiProperty({
    description: 'Nome Do cliente',
    example: 'João da Silva',
    type: String,
  })
  @IsNotEmpty({
    message: 'nome não pode ser vazio',
  })
  @IsString({
    message: 'nome deve ser uma string',
  })
  nome: string;

  @ApiProperty({
    description: 'Cpf Do cliente',
    example: '123.456.789-00',
    type: String,
  })
  @IsNotEmpty({
    message: 'cpf nao pode ser vazio',
  })
  @IsString({
    message: 'cpf deve ser uma string',
  })
  cpf: string;

  @ApiProperty({
    description: 'Telefone Do cliente',
    example: '11999999999',
    type: String,
  })
  @IsNotEmpty({
    message: 'telefone nao pode ser vazio',
  })
  @IsString({
    message: 'telefone deve ser uma string',
  })
  telefone: string;

  @ApiProperty({
    description: 'Email Do cliente',
    example: '7o5V2@example.com',
    type: String,
  })
  @IsNotEmpty({
    message: 'email nao pode ser vazio',
  })
  @IsString({
    message: 'email deve ser uma string',
  })
  email: string;

  @ApiProperty({
    description: 'Data de nascimento Do cliente',
    example: '2000-01-01',
    type: String,
  })
  @IsNotEmpty({
    message: 'data de nascimento nao pode ser vazio',
  })
  @Transform(({ value }) => new Date(value))
  dt_nascimento: Date;

  @ApiProperty({
    description: 'Token de identificação',
    example: '1234567890165195165154151',
    type: String,
  })
  @IsNotEmpty({
    message: 'token nao pode ser vazio',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Pix Copia e Cola Gerado',
    example:
      '20:50:akjshdjkwabndjklawhjdjlanLJKHKJABNWJKLDHjdbnlamhjklhklajnhdu',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'pix deve ser uma string',
  })
  pixCopiaECola: string;

  @ApiProperty({
    description: 'QrCode Pix Gerado',
    example: 'abcjkeyfdjkwabndjkcnkvbdmhxgbdfnbcKLDHjdbnlamhjklhklajnhdu',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'qrcode deve ser uma string',
  })
  qrcode: string;

  @ApiProperty({
    description: 'txid do Pix gerado',
    example: 'ixHkalsIamJM',
    type: String,
  })
  @IsNotEmpty({
    message: 'txid nao pode ser vazio',
  })
  @IsString({
    message: 'txid deve ser uma string',
  })
  txid: string;

  @ApiProperty({
    description: 'Valor do Pix gerado',
    example: 100,
    type: Number,
  })
  @IsNotEmpty({
    message: 'valor nao pode ser vazio',
  })
  @Type(() => Number)
  @IsNumber()
  valor: number;

  @ApiProperty({
    description: 'ImagemQrCode do Pix gerado',
    example: 'abcjkeyfdjkwabndjkcnkvbdmhxgbdfnbcKLDHjdbnlamhjklhklajnhdu',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'qrcode deve ser uma string',
  })
  imagemQrcode: string;
}
