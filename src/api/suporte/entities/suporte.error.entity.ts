import { ApiProperty } from '@nestjs/swagger';

export class ErrorSuporteEntity {
  @ApiProperty({
    type: 'string',
    description: 'Mensagem de erro',
  })
  message: string;
}
