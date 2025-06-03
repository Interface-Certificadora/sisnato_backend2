import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDiretoDto {
  @ApiProperty({
    description: 'Nome Do cliente',
    example: 'João da Silva',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'nome deve ser uma string',
  })
  nome?: string;

  @ApiProperty({
    description: 'Telefone Do cliente',
    example: '11999999999',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'telefone deve ser uma string',
  })
  telefone?: string;

  @ApiProperty({
    description: 'Telefone Do cliente',
    example: '11999999999',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'telefone deve ser uma string',
  })
  telefone2?: string;

  @ApiProperty({
    description: 'Email Do cliente',
    example: 'qKZV5@example.com',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'email deve ser uma string',
  })
  email?: string;

  @ApiProperty({
    description: 'Data de Nascimento Do cliente',
    example: '2000-01-01',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  dt_nascimento?: Date;

  @ApiProperty({
    description: 'Status Pgto Do cliente',
    example: 'PAGO',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'status_pgto deve ser uma string',
  })
  status_pgto?: string;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Id do financeiro da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'financeiro deve ser um número' })
  @IsPositive({ message: 'financeiro deve ser um número positivo' })
  @IsOptional()
  financeiro: number;

  @ApiProperty({
    example: '52394198729',
    description: 'Cpf Do cliente',
    type: String,
  })
  @IsString({
    message: 'cpf deve ser uma string',
  })
  @IsOptional()
  cpf?: string;

  @ApiProperty({
    example: [{ key: 'value', text: 'Alguma observação' }],
    description: 'Observações Do cliente (array de objetos)',
    type: [Object], // Indica um array de objetos para o Swagger
    required: false,
  })
  @IsArray({ message: 'obs deve ser um array de objetos' })
  @IsOptional()
  obs?: any[]; // Alterado para any[] para compatibilidade com Json[]

  @ApiProperty({
    required: false,
    example: ['123.456.789-00', '987.654.321-00'],
    description: 'Relacionamentos da solicitação',
    type: [String],
  })
  @IsArray({ message: 'relacionamentos deve ser um array' })
  @Transform(({ value }) => {
    for (let i = 0; i < value.length; i++) {
      value[i] = value[i].replace(/\D/g, '');
    }
    return value;
  })
  @IsOptional()
  relacionamentos: string[];
}
