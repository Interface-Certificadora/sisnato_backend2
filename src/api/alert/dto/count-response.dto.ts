import { ApiProperty } from '@nestjs/swagger';

export class CountResponseDto {
  @ApiProperty({
    description: 'A contagem total de alertas.',
    example: 10,
  })
  count: number;
}
