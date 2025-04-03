import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateSuporteDto {
  @ApiProperty({ description: 'ID do suporte', example: 1 })
  @IsNotEmpty({ message: 'ID do suporte é obrigatório' })
  @IsNumber()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  solicitacao: number;

  @ApiProperty({ description: 'Tag do suporte', example: 'TAG' })
  @IsNotEmpty({ message: 'Tag do suporte é obrigatório' })
  tag: string;

  @ApiPropertyOptional({
    description: 'Descrição do suporte',
    example: 'Descrição do suporte',
  })
  @IsOptional()
  descricao: string;

  @ApiPropertyOptional({
    description: 'URL do suporte',
    example: 'URL do suporte',
  })
  @IsOptional()
  urlview?: Object;
}
