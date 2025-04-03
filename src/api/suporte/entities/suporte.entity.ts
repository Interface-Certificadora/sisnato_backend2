import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class Suporte {
  @ApiResponseProperty({ type: Number })
  @IsNumber()
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @IsString()
  @Expose()
  tag: string;

  @ApiResponseProperty({ type: String })
  @IsString()
  @Expose()
  descricao: string;

  @ApiResponseProperty({ type: Number })
  @IsNumber()
  @Expose()
  solicitacao: number;

  @ApiResponseProperty({ type: String })
  @IsString()
  @Expose()
  imgSuspensa: string;

  @ApiResponseProperty({ type: Date })
  @IsDate()
  @Expose()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @IsDate()
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<Suporte>) {
    Object.assign(this, partial);
  }
}
