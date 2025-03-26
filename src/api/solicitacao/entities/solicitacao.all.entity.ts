export class SolicitacaoAll {
  id: number;
  nome: string;
  cpf: string;
  alerts: any[];
  distrato: boolean;
  dt_agendamento: Date;
  hr_agendamento: Date;
  dt_aprovacao: Date;
  hr_aprovacao: Date;
  type_validacao: string;
  alertanow: boolean;
  statusAtendimento: string;
  pause: boolean;
  andamento: string;
  financeiro: {
    select: {
      id: number;
      fantasia: string;
    };
  };
  construtora: {
    select: {
      id: number;
      fantasia: string;
    };
  };
  empreendimento: {
    select: {
      id: number;
      nome: string;
    };
  };
  corretor: {
    select: {
      id: number;
      nome: string;
    };
  };
}
