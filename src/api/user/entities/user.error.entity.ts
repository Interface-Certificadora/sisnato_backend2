import { ApiProperty } from '@nestjs/swagger';

export class ErrorUserEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
