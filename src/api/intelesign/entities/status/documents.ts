import { ApiProperty } from '@nestjs/swagger';
import { LinksCompletos } from './links-completos';

export class Documents {
  @ApiProperty({
    example: '16753767264654',
    description: 'ID do envelope uuid',
    type: String,
  })
  id: string;

  @ApiProperty({
    example: 'nome do documento',
    description: 'Nome do documento',
    type: String,
  })
  name: string;

  @ApiProperty({
    example: 'stage',
    description: 'Stage do documento',
    type: String,
  })
  stage: string;

  @ApiProperty({
    example: 'sha1',
    description: 'SHA1 do documento',
    type: String,
  })
  sha1: string;

  @ApiProperty({
    example: 1024,
    description: 'Tamanho do documento',
    type: Number,
  })
  size: number;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de criação do documento',
    type: String,
  })
  created_at: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de atualização do documento',
    type: String,
  })
  updated_at: string;

  @ApiProperty({
    example: [],
    description: 'Conteúdo do documento',
    type: Array,
  })
  contents: [];

  @ApiProperty({
    example: [],
    description: 'Campos do documento',
    type: Array,
  })
  fields: [];

  @ApiProperty({
    type: Object,
    description: 'Links do documento',
  })
  links: LinksCompletos;
}
