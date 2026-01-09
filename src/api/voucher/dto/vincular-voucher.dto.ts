import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class VincularVoucherDto {
  @ApiProperty({ description: 'ID da Solicitação (Venda)', example: 1050 })
  @IsNumber()
  solicitacaoId: number;

  @ApiProperty({
    description: 'ID do Usuário que está fazendo a ação',
    example: 1,
  })
  @IsNumber()
  usuarioId: number;

  @ApiProperty({
    description: 'ID do FCW2 (Opcional)',
    example: 55,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  fcw2Id?: number;

  @ApiProperty({
    description: 'Nome do Cliente (Opcional se passar ID)',
    required: false,
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({
    description: 'CPF do Cliente (Opcional se passar ID)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cpf?: string;
}
