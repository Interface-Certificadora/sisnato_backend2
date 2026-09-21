import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CpfClienteDto {
  @ApiProperty({ example: '123.456.789-00' })
  @IsNotEmpty({ message: 'cpf não pode ser vazio' })
  @IsString({ message: 'cpf deve ser uma string' })
  cpf: string;
}
