
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateDiretoTagDto {
  @ApiProperty()
  @IsNumber()
  diretoId: number;
  @ApiProperty()
  @IsNumber()
  tagId: number;
}
