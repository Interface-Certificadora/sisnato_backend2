import { ApiProperty } from '@nestjs/swagger';

export class ErrorChecktelEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
