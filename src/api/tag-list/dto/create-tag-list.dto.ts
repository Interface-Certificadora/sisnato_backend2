import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTagsListDto {
  @ApiProperty({
    example: 'tag',
    description: 'Label da tag',
    required: true,
  })
  @IsString()
  label: string;
}
