export class MesesEntity {
  mes: number;
  ano: number;
}

export class solicitacoesEntity {
  id: number;
  createdAt: Date;
  andamento: string;
  type_validacao: String;
  dt_aprovacao: Date | null;
  hr_aprovacao: Date | null;
  dt_agendamento: Date;
  hr_agendamento: Date;
  id_fcw: Number;
  uploadCnh: string | null;
  uploadRg: string | null;
  dt_aprovacao_formatada: string;
  hr_aprovacao_formatada: string;
  dt_agendamento_formatada: string;
  hr_agendamento_formatada: string;
  typeDoc: string;
}

export class solicitacoesSearchEntity {
  id: number;
  createdAt: Date;
  andamento: string;
  type_validacao: String;
  dt_aprovacao: Date | null;
  hr_aprovacao: Date | null;
  dt_agendamento: Date;
  hr_agendamento: Date;
  id_fcw: Number;
  typeDoc: string;
  tags: string[] | null;
  suporte: string[] | null;
  fcweb: fcwebEntity;
}

class fcwebEntity {
  id: number;
  andamento: string;
  dt_agenda: string;
  hr_agenda: string;
  dt_aprovacao: string;
  hr_aprovacao: string;
  reg_cnh: string;
  rg: string;
}
