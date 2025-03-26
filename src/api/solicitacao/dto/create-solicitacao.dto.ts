import { IsOptional } from "class-validator";

export class CreateSolicitacaoDto {
  id: number;
  nome: string;
  email: string;
  cpf: string;

  @IsOptional()
  telefone: string;

  @IsOptional()
  telefone2: string;

  @IsOptional()
  dt_nascimento: Date;

  @IsOptional()
  id_fcw: number;

  @IsOptional()
  obs: string;

  @IsOptional()
  cnh: string;

  @IsOptional()
  ativo: boolean;

  @IsOptional()
  uploadCnh: string;

  @IsOptional()
  uploadRg: string;

  @IsOptional()
  relacionamentos: object[];

  @IsOptional()
  rela_quest: boolean;

  @IsOptional()
  distrato: boolean;

  @IsOptional()
  dt_distrato: Date;

  @IsOptional()
  log: object[];

  @IsOptional()
  status_aprovacao: boolean;

  @IsOptional()
  distrato_id: number;

  @IsOptional()
  andamento: string;

  @IsOptional()
  type_validacao: string;

  @IsOptional()
  dt_aprovacao: Date;

  @IsOptional()
  hr_aprovacao: Date;

  @IsOptional()
  dt_agendamento: Date;

  @IsOptional()
  hr_agendamento: Date;

  @IsOptional()
  estatos_pgto: string;

  @IsOptional()
  valorcd: number;

  @IsOptional()
  situacao_pg: string;

  @IsOptional()
  freqSms: number;

  @IsOptional()
  alertanow: boolean;

  @IsOptional()
  dt_criacao_now: Date;

  @IsOptional()
  statusAtendimento: string;

  @IsOptional()
  pause: boolean;

  @IsOptional()
  corretor: object;

  @IsOptional()
  corretorId: number;

  @IsOptional()
  construtora: object;

  @IsOptional()
  construtoraId: number;

  @IsOptional()
  financeiro: object;

  @IsOptional()
  financeiroId: number;

  @IsOptional()
  empreendimento: object;

  @IsOptional()
  empreendimentoId: number;

  @IsOptional()
  alerts: object[];

  @IsOptional()
  tags: object[];

  @IsOptional()
  chamados: object[];

  @IsOptional()
  createdAt: Date;

  @IsOptional()
  updatedAt: Date;
}
