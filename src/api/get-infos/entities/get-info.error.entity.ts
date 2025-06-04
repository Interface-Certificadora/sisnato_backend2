import { ApiProperty } from '@nestjs/swagger';

export class GetInfoErrorEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
