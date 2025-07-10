import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class GetCorretorDto {
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Id do empreendimento da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'empreendimento deve ser um número' })
  @IsPositive({ message: 'empreendimento deve ser um número positivo' })
  @IsOptional()
  empreendimentoId: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Id da construtora da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'construtora deve ser um número' })
  @IsPositive({ message: 'construtora deve ser um número positivo' })
  @IsOptional()
  construtoraId: number;
}
