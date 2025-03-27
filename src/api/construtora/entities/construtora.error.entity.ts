import { ApiProperty } from '@nestjs/swagger';

export class ErrorConstrutoraEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
