import { ApiProperty } from '@nestjs/swagger';
import { Identifiers } from './identifiers';

export class Addressees {
  @ApiProperty({
    example: 'email',
    description: 'Via de notificação',
    type: String,
  })
  via: string;

  @ApiProperty({
    example: 'email@example.com',
    description: 'Valor do addressees',
    type: String,
  })
  value: string;

  @ApiProperty({
    example: 'john doe',
    description: 'Nome do addressees',
    type: String,
  })
  name: string;

  @ApiProperty({
    example: 'qualified',
    description: 'tipo de assinatura',
    type: String,
  })
  ran_action_at: string;

  identifiers: Identifiers[];
  triggers: any[];
}
