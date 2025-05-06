import { RelatorioFinanceiroEmpredimento } from './relatorio_financeiro_empredimento.entity';

export class RelatorioFinanceiroOne {
  id: number;
  protocolo: string;
  situacao_pg: number;
  nota_fiscal: string | null;
  start: Date;
  end: Date;
  dt_pg: Date | null;
  statusNota: boolean;
  createAt: Date;
  updatedAt: Date;
  construtoraId: number;
  total_cert: number;
  valorTotal: number;
  solicitacao: RelatorioFinanceiroEmpredimento[];
  pdf: string;
  xlsx: string;
  modelo: string;
  construtora: {
    id: number;
    cnpj: string;
    razaosocial: string;
    fantasia: string;
    tel: string;
    email: string | null;
    obs: string;
    status: boolean;
    valor_cert: number;
    responsavelId: number | null;
    createdAt: Date;
    updatedAt: Date;
    atividade: string;
  };
  constructor(partial: Partial<RelatorioFinanceiroOne>) {
    Object.assign(this, partial);
  }
}
