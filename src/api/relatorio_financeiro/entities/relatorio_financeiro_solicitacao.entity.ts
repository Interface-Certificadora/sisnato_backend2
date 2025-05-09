import { RelatorioFinanceiroFichas } from './relatorio_financeiro_fichas.entity';

export class RelatorioFinanceiroSolicitacao {
  id: number;
  cpf: string;
  nome: string;
  total: number;
  fichas: RelatorioFinanceiroFichas[];
  id_fcw: number;
  modelo: string;
  status: string;
  tipocd: string;
  corretor: {
    id: number;
    nome: string;
    telefone: string;
  };
  andamento: string;
  validacao: string;
  financeiro: {
    id: number;
    fantasia: string;
  };
  construtora: {
    id: number;
    fantasia: string;
  };
  dt_aprovacao: Date | null;
  dt_revogacao: Date | null;
  hr_aprovacao: Date | string | null;
  dt_agendamento: Date | null;
  empreendimento: {
    id: number;
    nome: string;
    cidade: string;
  };
  hr_agendamento: Date | string | null;
  valor_total_cert: number;

  constructor(partial: Partial<RelatorioFinanceiroSolicitacao>) {
    Object.assign(this, partial);
  }
}
