import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class Bug {
  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  descricao: string;

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  status: boolean;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  createAt: Date;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  updatedAt: Date;

  constructor(partial: Partial<Bug>) {
    Object.assign(this, partial);
  }
}
