import { ApiProperty } from '@nestjs/swagger';

export class DiretoTag {
  @ApiProperty({
    example: 1,
    description: 'Id da tag',
  })
  id: number;
  @ApiProperty({
    example: 1,
    description: 'Id do direto',
  })
  diretoId: number;
  @ApiProperty({
    example: 'Tag de exemplo',
    description: 'Descrição da tag',
  })
  descricao: string;
}