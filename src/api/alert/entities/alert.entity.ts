<<<<<<< Updated upstream
import { User } from '../../../api/user/entities/user.entity';
import { Empreendimento } from '../../../api/empreendimento/entities/empreendimento.entity';
import { SolicitacaoEntity } from '../../../api/solicitacao/entities/solicitacao.entity';
import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsDateString, IsNumber, IsObject, IsString } from 'class-validator';

export class AlertEntity {
  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  titulo: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  texto: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  solicitacao_id: number;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  corretor: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  tipo: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  tag: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  empreendimento: number;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  @IsBoolean()
  status: boolean;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDateString()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDateString()
  updatedAt: Date;

  @ApiResponseProperty({ type: User })
  @Expose()
  @IsObject()
  corretorData: User;

  @ApiResponseProperty({ type: Empreendimento })
  @Expose()
  @IsObject()
  empreendimentoData: Empreendimento;

  @ApiResponseProperty({ type: SolicitacaoEntity })
  @Expose()
  @IsObject()
  solicitacao: SolicitacaoEntity;

  constructor(el?: Partial<AlertEntity>) {
    this.id = el?.id
    this.titulo = el?.titulo
    this.texto = el?.texto
    this.solicitacao_id= el?.solicitacao_id
    this.corretor = el?.corretor
    this.tipo = el?.tipo
    this.tag = el?.tag
    this.empreendimento = el?.empreendimento
    this.status = el?.status
    this.corretorData = el?.corretorData
    this.empreendimentoData = el?.empreendimentoData
    this.solicitacao = el?.solicitacao
    this.createdAt = el?.createdAt
    this.updatedAt = el?.updatedAt
  }
=======
import { SolicitacaoEntity } from "../../../api/solicitacao/entities/solicitacao.entity"

export class AlertEntity {
  id: number
  titulo: string
  texto : string
  solicitacao_id: number
  corretor      : number
  tipo  : string
  tag   : string
  empreendimento: number
  status: boolean
  createdAt: Date
  updatedAt: Date
  corretorData: object
  empreendimentoData: object
  solicitacao:SolicitacaoEntity
>>>>>>> Stashed changes
}
