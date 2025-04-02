import { ApiProperty } from '@nestjs/swagger';

export class ErrorNowEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
