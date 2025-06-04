import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBugDto {
  @ApiProperty({
    example: 'Descrição do bug',
    description: 'Descrição do bug',
    required: true,
  })
  @IsString()
  descricao: string;
}
