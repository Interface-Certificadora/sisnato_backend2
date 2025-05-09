import { RelatorioFinanceiroSolicitacao } from './relatorio_financeiro_solicitacao.entity';

export class RelatorioFinanceiroEmpredimento {
  id: number;
  nome: string;
  total: number;
  valor: string;
  cidade: string;
  solicitacoes: RelatorioFinanceiroSolicitacao[];
  constructor(partial: Partial<RelatorioFinanceiroEmpredimento>) {
    Object.assign(this, partial);
  }
}
