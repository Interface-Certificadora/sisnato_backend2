import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CadastroClienteCcaDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsNotEmpty({ message: 'nome não pode ser vazio' })
  @IsString({ message: 'nome deve ser uma string' })
  nome: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsNotEmpty({ message: 'cpf não pode ser vazio' })
  @IsString({ message: 'cpf deve ser uma string' })
  cpf: string;

  @ApiProperty({ example: '11999999999' })
  @IsNotEmpty({ message: 'telefone não pode ser vazio' })
  @IsString({ message: 'telefone deve ser uma string' })
  telefone: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsNotEmpty({ message: 'email não pode ser vazio' })
  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsNotEmpty({ message: 'data de nascimento não pode ser vazia' })
  @Transform(({ value }) => new Date(value))
  dt_nascimento: Date;

  @ApiProperty({ description: 'id do cca (financeira)' })
  @IsNumber({}, { message: 'financeiroId deve ser um numero' })
  financeiroId: number;

  @ApiProperty({ description: 'id do empreendimento' })
  @IsNumber({}, { message: 'empreendimentoId deve ser um numero' })
  empreendimentoId: number;

  @ApiProperty({ description: 'URL base da página do cliente' })
  @IsString({ message: 'baseUrl deve ser uma string' })
  baseUrl: string;
}
