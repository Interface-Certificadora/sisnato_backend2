import { ApiProperty } from '@nestjs/swagger';

export class ErrorChamadoEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
