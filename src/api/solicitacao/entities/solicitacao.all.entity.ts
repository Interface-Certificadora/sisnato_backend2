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
  dt_agendamento: Date | null;

  @ApiProperty()
  hr_agendamento: Date | null;

  @ApiProperty()
  dt_aprovacao: Date | null;

  @ApiProperty()
  hr_aprovacao: Date | null;

  @ApiProperty()
  type_validacao: string;

  @ApiProperty()
  alertanow: boolean;

  @ApiProperty()
  ativo: boolean;

  @ApiProperty()
  statusAtendimento: boolean;

  @ApiProperty()
  pause: boolean;

  @ApiProperty()
  andamento: string;

  @ApiProperty(
    {
      type: 'object',
      properties: {
        id: { type: 'number' },
        nome: { type: 'string' },
      },
    }
  )
  corretor: {
    id: number;
    nome: string;
  };

  @ApiProperty(
    {
      type: 'object',
      properties: {
        id: { type: 'number' },
        fantasia: { type: 'string' },
      },
    }
  )
  construtora: {
    id: number;
    fantasia: string;
  };

  @ApiProperty(
    {
      type: 'object',
      properties: {
        id: { type: 'number' },
        nome: { type: 'string' },
        cidade: { type: 'string' },
      },
    }
  )
  empreendimento: {
    id: number;
    nome: string;
    cidade: string;
  };

  @ApiProperty(
    {
      type: 'object',
      properties: {
        id: { type: 'number' },
        fantasia: { type: 'string' },
      },
    }
  )
  financeiro: {
    id: number;
    fantasia: string;
  };

  @ApiProperty()
  id_fcw: number | null;

  @ApiProperty()
  tags: Array<string>;

  @ApiProperty()
  createdAt: Date;
}
