import { ApiProperty } from '@nestjs/swagger';
import { Recipient } from './recipient';
import { Documents } from './documents';

export class StatusEntity {
  @ApiProperty({
    example: '16753767264654',
    type: String,
  })
  id: string;

  @ApiProperty({
    example: '16753767264654',
    description: 'Hash do envelope',
    type: String,
  })
  hashid: string;

  @ApiProperty({
    example: 'created',
    description: 'Estado do envelope',
    type: String,
  })
  state: string;

  @ApiProperty({
    example: 'Titulo do envelope',
    description: 'Titulo do envelope',
    type: String,
  })
  title: string;

  @ApiProperty({
    example: 'Subtitulo do envelope',
    description: 'Subtitulo do envelope',
    type: String,
  })
  subject: string;

  @ApiProperty({
    example: 'Por favor, assine o documento para.....',
    description: 'Mensagem do envelope',
    type: String,
  })
  message: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de envio do envelope',
    type: String,
  })
  sent_at: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de expiração do envelope',
    type: String,
  })
  expire_at: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de criação do envelope',
    type: String,
  })
  created_at: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de atualização do envelope',
    type: String,
  })
  updated_at: string;

  @ApiProperty({
    example: 1,
    description: 'Frequência de lembretes',
    type: Number,
  })
  action_reminder_frequency: number;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data do próximo lembrete',
    type: String,
  })
  next_action_reminder_at: string;

  @ApiProperty({
    example: 1,
    description: 'Indicador de sandbox',
    type: Number,
  })
  is_sandbox: number;

  @ApiProperty({
    type: Object,
    description: 'Remetente do envelope',
  })
  sender: {
    name: string;
    email: string;
    avatar: string;
  };

  triggers: any[];
  recipients: Recipient[];
  documents: Documents[];
  metadata: any[];
}
