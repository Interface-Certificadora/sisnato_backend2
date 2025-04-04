import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateChamadoDto {
  @ApiProperty({
    description: 'Resposta de um ADM ao chamado',
    example: 'Descrição da Resposta do chamado',
    type: String,
  })
  @IsString({ message: 'Resposta deve ser uma string válida' })
  @IsNotEmpty({ message: 'Resposta não pode ser vazia' })
  resposta: string;

  @ApiProperty({
    description:
      'Status do chamado, 0 = iniciado, 1 = em andamento, 2 = enviado para NL2, 3 = concluído, 4 = cancelado',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'Status não pode ser vazio' })
  status: number;

  @ApiPropertyOptional({
    description: 'Lista de imagens associadas ao chamado',
    example: ['image1.jpg', 'image2.jpg'],
    type: Object,
  })
  @IsOptional()
  imagens_adm?: object;
}
