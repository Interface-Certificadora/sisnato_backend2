import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDiretoDto } from './create-direto.dto';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDiretoDto extends PartialType(CreateDiretoDto) {
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

  // @ApiProperty({
  //   required: false,
  //   example: 1,
  //   description: 'Id do financeiro da solicitação',
  //   type: Number,
  // })
  // @IsNumber({}, { message: 'financeiro deve ser um número' })
  // @IsPositive({ message: 'financeiro deve ser um número positivo' })
  // @IsOptional()
  // financeiro: number;
}
