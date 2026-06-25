import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Agente } from './agente.model';

@Table({ tableName: 'agendamentos', timestamps: false })
export class Agendamento extends Model<Agendamento> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @Column({ type: DataType.INTEGER })
  id_fcweb: number;

  @Column({ type: DataType.DATEONLY })
  data_agendada: string;

  @Column({ type: DataType.TIME })
  hora_agendada: string;

  @Column({
    type: DataType.ENUM(
      'VIDEO CONF',
      'VIDEO GT',
      'VIDEO APP',
      'INTERNA',
      'EXTERNA',
      'EMISAO_ONLINE',
    ),
  })
  modalidade: string;

  @ForeignKey(() => Agente)
  @Column({ type: DataType.INTEGER })
  agente_id: number;

  @BelongsTo(() => Agente)
  agente: Agente;
}
