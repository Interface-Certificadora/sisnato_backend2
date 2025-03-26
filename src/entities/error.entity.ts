import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ErrorEntity {
  @IsString()
  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Mensagem de erro',
    type: String,
  })
  message: string;
}
