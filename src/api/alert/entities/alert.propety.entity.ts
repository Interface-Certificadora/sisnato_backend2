import { User } from '../../../api/user/entities/user.entity';
import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class AlertPropertyEntity {
  @ApiResponseProperty({ type: () => Number })
  @IsNumber()
  id: number;

  @ApiResponseProperty({ type: () => String })
  @IsString()
  titulo: string;

  @ApiResponseProperty({ type: () => String })
  @IsString()
  descricao: string;

  @ApiResponseProperty({ type: () => Number })
  @IsNumber()
  solicitacao_id: number;

  @ApiResponseProperty({ type: () => Number })
  @IsNumber()
  corretor: number;

  @ApiResponseProperty({ type: () => String })
  @IsString()
  tag: string;

  @ApiResponseProperty({ type: () => Number })
  @IsNumber()
  @IsOptional()
  empreendimento: number;

  @ApiResponseProperty({ type: () => Boolean })
  @IsBoolean()
  status: boolean;

  @ApiResponseProperty({ type: () => Date })
  @IsDateString()
  createdAt: Date;

  @ApiResponseProperty({ type: () => Date })
  @IsDateString()
  @IsOptional()
  updatedAt: Date;

  @ApiResponseProperty({ type: () => User })
  @IsObject()
  @IsOptional()
  corretorData: User;

  constructor(el?: Partial<AlertPropertyEntity>) {
    Object.assign(this, el);
  }
}
