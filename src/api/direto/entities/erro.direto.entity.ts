import { ApiProperty } from '@nestjs/swagger';

export class ErrorDiretoEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
