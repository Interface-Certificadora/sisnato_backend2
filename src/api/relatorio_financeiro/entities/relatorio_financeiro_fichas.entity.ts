export class RelatorioFinanceiroFichas {
    id: number;
    modelo: string;
    tipocd: string;
    valorcd: string;
    andamento: string;
    dt_agenda: Date;
    formapgto: string;
    hr_agenda: string;
    validacao: string;
    dt_aprovacao: Date;
    dt_revogacao: Date | null;
    hr_aprovacao: string;
    constructor(partial: Partial<RelatorioFinanceiroFichas>) {
      Object.assign(this, partial);
    }
}
