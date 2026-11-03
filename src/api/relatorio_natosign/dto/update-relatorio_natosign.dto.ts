import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateRelatorioNatosignDto {
  @ApiProperty({
    example: 1,
    description: 'Situação: 0 em análise, 1 pendente, 2 pago',
    required: false,
  })
  @IsIn([0, 1, 2], { message: 'situacao_pg deve ser 0, 1 ou 2' })
  @IsOptional()
  situacao_pg?: number;

  @ApiProperty({
    example: '12345',
    description: 'Nota fiscal',
    required: false,
  })
  @IsString({ message: 'Nota fiscal deve ser uma string' })
  @IsOptional()
  nota_fiscal?: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de pagamento',
    required: false,
  })
  @IsDateString({}, { message: 'Data de pagamento deve ser uma data' })
  @IsOptional()
  dt_pg?: Date;
}
