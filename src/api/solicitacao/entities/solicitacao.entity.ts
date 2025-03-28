import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { AlertEntity } from '../../../api/alert/entities/alert.entity';
import { Expose } from 'class-transformer';
import { User } from '../../../api/user/entities/user.entity';
import { Construtora } from '../../../api/construtora/entities/construtora.entity';
import { Financeiro } from '../../../api/financeiro/entities/financeiro.entity';
import { Empreendimento } from '../../../api/empreendimento/entities/empreendimento.entity';

export class SolicitacaoEntity {
  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  nome: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  email: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  cpf: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  @IsString()
  telefone: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  telefone2: string;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  dt_nascimento: Date;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  id_fcw: number;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  obs: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  cnh: string;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  @IsBoolean()
  ativo: boolean;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  uploadCnh: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  uploadRg: string;

  @ApiResponseProperty({ type: [SolicitacaoEntity] })
  @Expose()
  @IsArray()
  relacionamentos: SolicitacaoEntity[];

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  @IsBoolean()
  rela_quest: boolean;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  @IsBoolean()
  distrato: boolean;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  dt_distrato: Date;

  @ApiResponseProperty({ type: [String] })
  @Expose()
  log: string[];

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  @IsBoolean()
  status_aprovacao: boolean;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  distrato_id: number;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  andamento: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  type_validacao: string;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  dt_aprovacao: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  hr_aprovacao: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  dt_agendamento: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  hr_agendamento: Date;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  estatos_pgto: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  valorcd: number;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  situacao_pg: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  freqSms: number;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  @IsBoolean()
  alertanow: boolean;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  dt_criacao_now: Date;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  statusAtendimento: string;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
  @IsBoolean()
  pause: boolean;

  @ApiResponseProperty({ type: User })
  @Expose()
  @IsObject()
  corretor: User;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  corretorId: number;

  @ApiResponseProperty({ type: Construtora })
  @Expose()
  @IsObject()
  construtora: Construtora;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  construtoraId: number;

  @ApiResponseProperty({ type: Financeiro })
  @Expose()
  @IsObject()
  financeiro: Financeiro;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  financeiroId: number;

  @ApiResponseProperty({ type: Empreendimento })
  @Expose()
  @IsObject()
  empreendimento: Empreendimento;

  @ApiResponseProperty({ type: Number })
  @Expose()
  @IsNumber()
  empreendimentoId: number;

  @ApiResponseProperty({ type: [AlertEntity] })
  @Expose()
  @IsArray()
  alerts: AlertEntity[];

  @ApiResponseProperty({ type: [Object] })
  @Expose()
  @IsArray()
  tags: object[];

  @ApiResponseProperty({ type: [Object] })
  @Expose()
  @IsArray()
  chamados: object[];

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  updatedAt: Date;
}