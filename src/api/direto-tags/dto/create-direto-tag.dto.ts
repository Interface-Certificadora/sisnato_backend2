import { ApiProperty } from '@nestjs/swagger';

export class CreateDiretoTagDto {
  @ApiProperty({
    example: 'Tag de exemplo',
    description: 'Descrição da tag',
  })
  descricao: string;
  @ApiProperty({
    example: 1,
    description: 'Id do direto',
  })
  diretoId: number;
}