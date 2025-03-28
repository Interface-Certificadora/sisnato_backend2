<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { AlertEntity } from '../../../api/alert/entities/alert.entity';

export class SolicitacaoEntity {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsString()
  telefone: string;

  @IsString()
<<<<<<< Updated upstream
  @ApiResponseProperty({ type: String })
  @Expose()
  telefone2: string;

  @ApiResponseProperty({ type: Date })
  @Expose()
  @IsDate()
  dt_nascimento: Date;

  @ApiResponseProperty({ type: Number })
  @Expose()
=======
  @ApiProperty()
  telefone2: string;

  @ApiProperty()
  @IsDate()
  dt_nascimento: Date;

  @ApiProperty()
>>>>>>> Stashed changes
=======
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { AlertEntity } from '../../../api/alert/entities/alert.entity';

export class SolicitacaoEntity {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty()
  @IsString()
  telefone: string;

  @IsString()
  @ApiProperty()
  telefone2: string;

  @ApiProperty()
  @IsDate()
  dt_nascimento: Date;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsNumber()
  id_fcw: number;

  @IsString()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  @ApiResponseProperty({ type: String })
  @Expose()
  obs: string;

  @IsString()
  @ApiResponseProperty({ type: String })
  @Expose()
  cnh: string;

  @ApiResponseProperty({ type: Boolean })
  @Expose()
=======
  @ApiProperty()
  obs: string;

  @IsString()
  @ApiProperty()
  cnh: string;

  @ApiProperty()
>>>>>>> Stashed changes
=======
  @ApiProperty()
  obs: string;

  @IsString()
  @ApiProperty()
  cnh: string;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsBoolean()
  ativo: boolean;

  @IsString()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
  @ApiProperty()
  uploadCnh: string;

  @IsString()
  @ApiProperty()
  uploadRg: string;

  @ApiProperty()
  @IsArray()
  relacionamentos: object[];

  @ApiProperty()
  @IsBoolean()
  rela_quest: boolean;

  @ApiProperty()
  @IsBoolean()
  distrato: boolean;

  @ApiProperty()
  @IsDate()
  dt_distrato: Date;

  @ApiProperty()
  log: string[];

  @ApiProperty()
  @IsBoolean()
  status_aprovacao: boolean;

  @ApiProperty()
>>>>>>> Stashed changes
=======
  @ApiProperty()
  uploadCnh: string;

  @IsString()
  @ApiProperty()
  uploadRg: string;

  @ApiProperty()
  @IsArray()
  relacionamentos: object[];

  @ApiProperty()
  @IsBoolean()
  rela_quest: boolean;

  @ApiProperty()
  @IsBoolean()
  distrato: boolean;

  @ApiProperty()
  @IsDate()
  dt_distrato: Date;

  @ApiProperty()
  log: string[];

  @ApiProperty()
  @IsBoolean()
  status_aprovacao: boolean;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsNumber()
  distrato_id: number;

  @IsString()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
  @ApiProperty()
  andamento: string;

  @IsString()
  @ApiProperty()
  type_validacao: string;

  @ApiProperty()
  @IsDate()
  dt_aprovacao: Date;

  @ApiProperty()
  @IsDate()
  hr_aprovacao: Date;

  @ApiProperty()
  @IsDate()
  dt_agendamento: Date;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsDate()
  hr_agendamento: Date;

  @IsString()
<<<<<<< Updated upstream
  @ApiResponseProperty({ type: String })
  @Expose()
  estatos_pgto: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
=======
  @ApiProperty()
  estatos_pgto: string;

  @ApiProperty()
>>>>>>> Stashed changes
=======
  @ApiProperty()
  andamento: string;

  @IsString()
  @ApiProperty()
  type_validacao: string;

  @ApiProperty()
  @IsDate()
  dt_aprovacao: Date;

  @ApiProperty()
  @IsDate()
  hr_aprovacao: Date;

  @ApiProperty()
  @IsDate()
  dt_agendamento: Date;

  @ApiProperty()
  @IsDate()
  hr_agendamento: Date;

  @IsString()
  @ApiProperty()
  estatos_pgto: string;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsNumber()
  valorcd: number;

  @IsString()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
  @ApiProperty()
  situacao_pg: string;

  @ApiProperty()
  @IsNumber()
  freqSms: number;

  @ApiProperty()
  @IsBoolean()
  alertanow: boolean;

  @ApiProperty()
>>>>>>> Stashed changes
=======
  @ApiProperty()
  situacao_pg: string;

  @ApiProperty()
  @IsNumber()
  freqSms: number;

  @ApiProperty()
  @IsBoolean()
  alertanow: boolean;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsDate()
  dt_criacao_now: Date;

  @IsString()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
  @ApiProperty()
  statusAtendimento: string;

  @ApiProperty()
  @IsBoolean()
  pause: boolean;

  @ApiProperty()
  @IsObject()
  corretor: object;

  @ApiProperty()
  @IsNumber()
  corretorId: number;

  @ApiProperty()
  @IsObject()
  construtora: object;

  @ApiProperty()
  @IsNumber()
  construtoraId: number;

  @ApiProperty()
  @IsObject()
  financeiro: object;

  @ApiProperty()
  @IsNumber()
  financeiroId: number;

  @ApiProperty()
  @IsObject()
  empreendimento: object;

  @ApiProperty()
  @IsNumber()
  empreendimentoId: number;

  @ApiProperty()
  @IsArray()
  alerts: AlertEntity[];

  @ApiProperty()
  @IsArray()
  tags: object[];

  @ApiProperty()
  @IsArray()
  chamados: object[];

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
>>>>>>> Stashed changes
  @IsDate()
=======
  @ApiProperty()
  statusAtendimento: string;

  @ApiProperty()
  @IsBoolean()
  pause: boolean;

  @ApiProperty()
  @IsObject()
  corretor: object;

  @ApiProperty()
  @IsNumber()
  corretorId: number;

  @ApiProperty()
  @IsObject()
  construtora: object;

  @ApiProperty()
  @IsNumber()
  construtoraId: number;

  @ApiProperty()
  @IsObject()
  financeiro: object;

  @ApiProperty()
  @IsNumber()
  financeiroId: number;

  @ApiProperty()
  @IsObject()
  empreendimento: object;

  @ApiProperty()
  @IsNumber()
  empreendimentoId: number;

  @ApiProperty()
  @IsArray()
  alerts: AlertEntity[];

  @ApiProperty()
  @IsArray()
  tags: object[];

  @ApiProperty()
  @IsArray()
  chamados: object[];

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
>>>>>>> Stashed changes
  updatedAt: Date;
}
