import { ApiProperty } from '@nestjs/swagger';

export class Identifiers {
  @ApiProperty({
    example: 'email',
    description: 'Código do identificador',
    type: String,
  })
  code: string;

  @ApiProperty({
    example: 'email',
    description: 'Título do identificador',
    type: String,
  })
  title: string;

  @ApiProperty({
    example: 'text',
    description: 'Tipo do identificador',
    type: String,
  })
  type: string;

  @ApiProperty({
    example: true,
    description: 'Se o identificador é obrigatório',
    type: Boolean,
  })
  is_required: boolean;

  @ApiProperty({
    example: '',
    description: 'Valor do identificador',
    type: String,
  })
  value: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de preenchimento',
    type: String,
  })
  filled_at: string;
}
