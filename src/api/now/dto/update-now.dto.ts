import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateNowDto {
  @ApiProperty({ description: 'Ativar o now', example: true })
  @IsBoolean({ message: 'alertanow deve ser true ou false' })
  @Type(() => Boolean)
  alertanow: boolean;
}
