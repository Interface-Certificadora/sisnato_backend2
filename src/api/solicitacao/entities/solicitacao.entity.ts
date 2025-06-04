import { ApiResponseProperty } from '@nestjs/swagger';
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
import { Transform } from 'class-transformer';
import { TagEntity } from 'src/api/tag/entities/tag.entity';

/**
 * Entity for Solicitacao.
 * @class
 * @property {number} id - The id of the solicitacao.
 * @property {string} nome - The name of the solicitacao.
 * @property {string} email - The email of the solicitacao.
 * @property {string} cpf - The cpf of the solicitacao.
 * @property {string} telefone - The telefone of the solicitacao.
 * @property {string} telefone2 - The telefone2 of the solicitacao.
 * @property {Date} dt_nascimento - The dt_nascimento of the solicitacao.
 * @property {number} id_fcw - The id_fcw of the solicitacao.
 * @property {string} obs - The obs of the solicitacao.
 * @property {string} cnh - The cnh of the solicitacao.
 * @property {string} uploadCnh - The uploadCnh of the solicitacao.
 * @property {string} uploadRg - The uploadRg of the solicitacao.
 * @property {boolean} ativo - The ativo of the solicitacao.
 * @property {string} andamento - The andamento of the solicitacao.
 * @property {string} type_validacao - The type_validacao of the solicitacao.
 * @property {Date} dt_aprovacao - The dt_aprovacao of the solicitacao.
 * @property {Date} hr_aprovacao - The hr_aprovacao of the solicitacao.
 * @property {Date} dt_agendamento - The dt_agendamento of the solicitacao.
 * @property {Date} hr_agendamento - The hr_agendamento of the solicitacao.
 * @property {string} estatos_pgto - The estatos_pgto of the solicitacao.
 * @property {number} valorcd - The valorcd of the solicitacao.
 * @property {string} situacao_pg - The situacao_pg of the solicitacao.
 * @property {number} freqSms - The freqSms of the solicitacao.
 * @property {boolean} alertanow - The alertanow of the solicitacao.
 * @property {Date} dt_criacao_now - The dt_criacao_now of the solicitacao.
 * @property {string} statusAtendimento - The statusAtendimento of the solicitacao.
 * @property {boolean} pause - The pause of the solicitacao.
 * @property {User} corretor - The corretor of the solicitacao.
 * @property {number} corretorId - The corretorId of the solicitacao.
 * @property {Construtora} construtora - The construtora of the solicitacao.
 * @property {number} construtoraId - The construtoraId of the solicitacao.
 * @property {Financeiro} financeiro - The financeiro of the solicitacao.
 * @property {number} financeiroId - The financeiroId of the solicitacao.
 * @property {Empreendimento} empreendimento - The empreendimento of the solicitacao.
 * @property {number} empreendimentoId - The empreendimentoId of the solicitacao.
 * @property {AlertPropertyEntity[]} alerts - The alerts of the solicitacao.
 * @property {object[]} tags - The tags of the solicitacao.
 * @property {object[]} chamados - The chamados of the solicitacao.
 * @property {Date} createdAt - The createdAt of the solicitacao.
 * @property {Date} updatedAt - The updatedAt of the solicitacao.
 * @property {object[]} relacionamentos - The relacionamentos of the solicitacao.
 * @property {boolean} rela_quest - The rela_quest of the solicitacao.
 * @property {boolean} distrato - The distrato of the solicitacao.
 * @property {Date} dt_distrato - The dt_distrato of the solicitacao.
 * @property {string[]} log - The log of the solicitacao.
 * @property {boolean} status_aprovacao - The status_aprovacao of the solicitacao.
 * @property {number} distrato_id - The distrato_id of the solicitacao.
 */
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
  @ApiResponseProperty({ type: String }) // Alterado de Object para String
  @IsOptional()
  uploadCnh: Object;

  @IsString()
  @ApiResponseProperty({ type: String }) // Alterado de Object para String
  @IsOptional()
  uploadRg: Object;

  @ApiResponseProperty({ type: () => [SolicitacaoEntity] })
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

  @ApiResponseProperty({ type: () => [AlertPropertyEntity] })
  @IsOptional()
  @IsArray()
  alerts: AlertPropertyEntity[];

  @ApiResponseProperty({ type: [Object] })
  @IsOptional()
  @IsArray()
  chamados: object[];

  @ApiResponseProperty({ type: [TagEntity] })
  @IsOptional()
  @IsArray()
  tags: TagEntity[];

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @IsOptional()
  @IsDate()
  updatedAt: Date;

  constructor(partial: Partial<SolicitacaoEntity>) {
    Object.assign(this, partial);
  }
}
