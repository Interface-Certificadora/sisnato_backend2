import { ApiProperty } from '@nestjs/swagger';
import { Addressees } from './addressees';
import { Links } from './links';

export class Recipient {
  @ApiProperty({
    example: '16753767264654',
    description: 'ID do envelope uuid',
    type: String,
  })
  id: string;

  @ApiProperty({
    example: 'created',
    description: 'Estado do envelope',
    type: String,
  })
  state: string;

  @ApiProperty({
    example: 'signer',
    description: 'Tipo do envelope',
    type: String,
  })
  type: string;

  @ApiProperty({
    example: 1,
    description: 'Ordem de roteamento',
    type: Number,
  })
  routing_order: number;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de notificação',
    type: String,
  })
  notified_at: string;

  @ApiProperty({
    type: Object,
    description: 'Addressees do envelope',
  })
  addressees: Addressees[];
  
  links: Links;
}
