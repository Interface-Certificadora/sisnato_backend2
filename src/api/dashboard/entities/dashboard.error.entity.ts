import { ApiProperty } from '@nestjs/swagger';

export class ErrorDashboardEntity {
  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
