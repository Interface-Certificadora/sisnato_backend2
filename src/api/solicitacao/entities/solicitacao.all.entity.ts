import { ApiProperty } from '@nestjs/swagger';

export class SolicitacaoAll {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  cpf: string;

  // @ApiProperty({ type: [Object] }) // Se puder, troque `any[]` por um tipo mais específico
  // alerts: any[];

  @ApiProperty()
  distrato: boolean;

  @ApiProperty()
  dt_agendamento: Date;

  @ApiProperty()
  hr_agendamento: Date;

  @ApiProperty()
  dt_aprovacao: Date;

  @ApiProperty()
  hr_aprovacao: Date;

  @ApiProperty()
  type_validacao: string;

  @ApiProperty()
  alertanow: boolean;

  @ApiProperty()
  statusAtendimento: string;

  @ApiProperty()
  pause: boolean;

  @ApiProperty()
  andamento: string;

  // @ApiProperty({ type: () => Object }) // ⬅️ Use `() => Tipo` para evitar circularidade
  // financeiro: {
  //   select: {
  //     id: number;
  //     fantasia: string;
  //   };
  // };

  // @ApiProperty({ type: () => Object }) // ⬅️ Mesmo ajuste aqui
  // construtora: {
  //   select: {
  //     id: number;
  //     fantasia: string;
  //   };
  // };

  // @ApiProperty({ type: () => Object }) // ⬅️ Para evitar referência direta
  // empreendimento: {
  //   select: {
  //     id: number;
  //     nome: string;
  //   };
  // };

  // @ApiProperty({ type: () => Object }) // ⬅️ Se necessário, crie uma classe separada para `Corretor`
  // corretor: {
  //   select: {
  //     id: number;
  //     nome: string;
  //   };
  // };
}
