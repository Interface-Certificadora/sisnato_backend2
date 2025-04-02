import { User } from '../../../api/user/entities/user.entity';
import { Empreendimento } from '../../../api/empreendimento/entities/empreendimento.entity';
import { SolicitacaoEntity } from '../../../api/solicitacao/entities/solicitacao.entity';
import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class AlertEntity {
  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  titulo: string;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  texto: string;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  solicitacao_id: number;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  corretor: number;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  tipo: string;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  tag: string;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  empreendimento: number;

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  status: boolean;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDateString()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDateString()
  updatedAt: Date;

  @ApiResponseProperty({ type: User })
  @IsOptional()
  @IsObject()
  corretorData: User;

  @ApiResponseProperty({ type: Empreendimento })
  @IsOptional()
  @IsObject()
  empreendimentoData: Empreendimento;

  @ApiResponseProperty({ type: SolicitacaoEntity })
  @IsOptional()
  @IsObject()
  solicitacao: SolicitacaoEntity;

  constructor(ev?: Partial<AlertEntity>) {
    Object.assign(this, ev);
  }
}
