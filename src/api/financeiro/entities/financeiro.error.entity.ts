import { ApiProperty } from '@nestjs/swagger';

export class ErrorFinanceiroEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
