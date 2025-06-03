import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";



export class TagListEntity {
  @ApiProperty({
    example: 1,
    description: 'Id da tagList',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  id: number;
  
  @ApiProperty({
    example: 'tag',
    description: 'Label da tagList',
    required: true,
  })
  @IsOptional()
  @IsString()
  label: string;

@ApiProperty({
    example: '2025-06-03T12:54:09.000Z',
    description: 'Data de criação da tagList',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAt: Date;

  constructor(ev?: Partial<TagListEntity>) {
    Object.assign(this, ev);
  }
}
