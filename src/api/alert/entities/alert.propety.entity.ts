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
  @IsOptional()
  id: number;

  @ApiResponseProperty({ type: () => String })
  @IsString()
  @IsOptional()
  titulo: string;

  @ApiResponseProperty({ type: () => String })
  @IsString()
  @IsOptional()
  texto: string;

  @ApiResponseProperty({ type: () => Number })
  @IsNumber()
  @IsOptional()
  solicitacao_id: number;

  @ApiResponseProperty({ type: () => Number })
  @IsNumber()
  @IsOptional()
  corretor: number;

  @ApiResponseProperty({ type: () => String })
  @IsString()
  @IsOptional()
  tipo: string;

  @ApiResponseProperty({ type: () => String })
  @IsString()
  @IsOptional()
  tag: string;

  @ApiResponseProperty({ type: () => Number })
  @IsNumber()
  @IsOptional()
  empreendimento: number;

  @ApiResponseProperty({ type: () => Boolean })
  @IsBoolean()
  @IsOptional()
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
    this.id = el?.id;
    this.titulo = el?.titulo;
    this.texto = el?.texto;
    this.solicitacao_id = el?.solicitacao_id;
    this.corretor = el?.corretor;
    this.tipo = el?.tipo;
    this.tag = el?.tag;
    this.empreendimento = el?.empreendimento;
    this.status = el?.status;
    this.corretorData = el?.corretorData;
    this.createdAt = el?.createdAt;
    this.updatedAt = el?.updatedAt;
  }
}
