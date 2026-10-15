import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ReenviarIntelesignDto {
  @ApiPropertyOptional({
    description:
      'ID do signatário (IntelesignSignatario). Sem ele, reenvia para todos os pendentes',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  signatarioId?: number;
}
