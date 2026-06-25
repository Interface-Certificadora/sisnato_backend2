import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { AgenteModalidade } from './agente-modalidade.model';
import { AgenteDisponibilidade } from './agente-disponibilidade.model';
import { Agendamento } from './agendamento.model';

@Table({ tableName: 'agentes', timestamps: false })
export class Agente extends Model<Agente> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @Column({ type: DataType.STRING })
  nome: string;

  @Column({ type: DataType.INTEGER })
  ativo: number;

  @HasMany(() => AgenteModalidade)
  modalidades: AgenteModalidade[];

  @HasMany(() => AgenteDisponibilidade)
  disponibilidades: AgenteDisponibilidade[];

  @HasMany(() => Agendamento)
  agendamentos: Agendamento[];
}
