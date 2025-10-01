import { ApiProperty } from '@nestjs/swagger';

export class Links {
  @ApiProperty({
    example: 'https://api.intelesign.com/v1/envelopes/16753767264654',
    description: 'Link do envelope',
    type: String,
  })
  envelope: string;
}
