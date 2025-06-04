import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateSuporteDto {
  @ApiPropertyOptional({ description: 'Tag do suporte', example: 'TAG' })
  @IsNotEmpty({ message: 'Tag do suporte é obrigatório' })
  tag?: string;

  @ApiPropertyOptional({
    description: 'Descrição do suporte',
    example: 'Descrição do suporte',
  })
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'URL do suporte',
    example: 'URL do suporte',
  })
  @IsOptional()
  urlview?: Object;

  @ApiPropertyOptional({
    description: 'filenames das imagens apagadas',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsOptional()
  filenames?: string[];
}
