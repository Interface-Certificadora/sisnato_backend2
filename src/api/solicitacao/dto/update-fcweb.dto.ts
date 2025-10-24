import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFcwebDto {
  @ApiProperty({
    example: 1,
    description: 'atualização d ficha de cadastro',
    required: true,
  })
  @IsNumber({}, { message: 'id_fcw deve ser um número' })
  @IsNotEmpty({ message: 'id_fcw deve ser informado' })
  id_fcw: number;

  @ApiProperty({
    example: 'APROVADO',
    description: 'atualização d ficha de cadastro',
    required: true,
  })
  @IsString({ message: 'andamento deve ser uma string' })
  @IsOptional()
  andamento: string;
}
