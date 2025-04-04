import { ApiProperty } from '@nestjs/swagger';

export class SolicitacaoAll {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  cpf: string;

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

}
