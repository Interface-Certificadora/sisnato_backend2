import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { User } from '../../../api/user/entities/user.entity';
import { Construtora } from '../../../api/construtora/entities/construtora.entity';
import { Financeiro } from '../../../api/financeiro/entities/financeiro.entity';
import { Empreendimento } from '../../../api/empreendimento/entities/empreendimento.entity';
import { AlertPropertyEntity } from '../../../api/alert/entities/alert.propety.entity';

export class SolicitacaoEntity {
  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  nome: string;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  email: string;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  cpf: string;

  @ApiResponseProperty({ type: String })
  @IsOptional()
  @IsString()
  telefone: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  telefone2: string;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  dt_nascimento: Date;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  id_fcw: number;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  obs: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  cnh: string;

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  ativo: boolean;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  uploadCnh: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  uploadRg: string;

  @ApiResponseProperty({ type: [SolicitacaoEntity] })
  @IsOptional()
  @IsArray()
  relacionamentos: SolicitacaoEntity[];

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  rela_quest: boolean;

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  distrato: boolean;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  dt_distrato: Date;

  @ApiResponseProperty({ type: [String] })
  @IsOptional()
  log: string[];

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  status_aprovacao: boolean;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  distrato_id: number;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  andamento: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  type_validacao: string;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  dt_aprovacao: Date;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  hr_aprovacao: Date;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  dt_agendamento: Date;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  hr_agendamento: Date;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  estatos_pgto: string;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  valorcd: number;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  situacao_pg: string;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  freqSms: number;

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  alertanow: boolean;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  dt_criacao_now: Date;

  @IsString()
  @ApiResponseProperty({ type: String })
  @IsOptional()
  statusAtendimento: string;

  @ApiResponseProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  pause: boolean;

  @ApiResponseProperty({ type: User })
  @IsOptional()
  @IsObject()
  corretor: User;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  corretorId: number;

  @ApiResponseProperty({ type: Construtora })
  @IsOptional()
  @IsObject()
  construtora: Construtora;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  construtoraId: number;

  @ApiResponseProperty({ type: Financeiro })
  @IsOptional()
  @IsObject()
  financeiro: Financeiro;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  financeiroId: number;

  @ApiResponseProperty({ type: Empreendimento })
  @IsOptional()
  @IsObject()
  empreendimento: Empreendimento;

  @ApiResponseProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  empreendimentoId: number;

  @ApiResponseProperty({ type: () => [AlertPropertyEntity]  })
  @IsOptional()
  @IsArray()
  alerts: AlertPropertyEntity[];

  @ApiResponseProperty({ type: [Object] })
  @IsOptional()
  @IsArray()
  tags: object[];

  @ApiResponseProperty({ type: [Object] })
  @IsOptional()
  @IsArray()
  chamados: object[];

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  updatedAt: Date;


  constructor (partial: Partial<SolicitacaoEntity>) {
    this.id = partial?.id;
    this.andamento = partial?.andamento;
    this.type_validacao = partial?.type_validacao;
    this.dt_aprovacao = partial?.dt_aprovacao;
    this.hr_aprovacao = partial?.hr_aprovacao;
    this.dt_agendamento = partial?.dt_agendamento;
    this.hr_agendamento = partial?.hr_agendamento;
    this.estatos_pgto = partial?.estatos_pgto;
    this.valorcd = partial?.valorcd;
    this.situacao_pg = partial?.situacao_pg;
    this.freqSms = partial?.freqSms;
    this.alertanow = partial?.alertanow;
    this.dt_criacao_now = partial?.dt_criacao_now;

  }
}