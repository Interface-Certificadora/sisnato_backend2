import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelarIntelesignDto {
  @ApiPropertyOptional({
    description: 'Motivo do cancelamento',
    example: 'Contrato enviado com dados errados',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
