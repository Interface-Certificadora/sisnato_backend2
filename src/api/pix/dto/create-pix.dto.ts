import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para criação de um novo PIX
 * @param cpf - CPF do devedor
 * @param nome - Nome do devedor
 * @param valor - Valor do PIX Ex.: 100.00
 */
export class CreatePixDto {
  @ApiProperty({
    description: 'cpf',
    example: '12345678900',
    type: String,
  })
  @IsNotEmpty({
    message: 'cpf is required',
  })
  @IsString({
    message: 'cpf must be a string',
  })
  cpf: string;

  @ApiProperty({
    description: 'Nome',
    example: 'João da Silva',
    type: String,
  })
  @IsNotEmpty({
    message: 'nome is required',
  })
  @IsString({
    message: 'nome must be a string',
  })
  nome: string;

  @ApiProperty({
    description: 'Valor do pix',
    example: '100.00',
    type: String,
  })
  @IsNotEmpty({
    message: 'valor is required',
  })
  @IsString({
    message: 'valor must be a string',
  })
  valor: string;
}
