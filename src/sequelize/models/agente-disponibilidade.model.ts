import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Agente } from './agente.model';

@Table({ tableName: 'agente_disponibilidade', timestamps: false })
export class AgenteDisponibilidade extends Model<AgenteDisponibilidade> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => Agente)
  @Column({ type: DataType.INTEGER })
  agente_id: number;

  @Column({
    type: DataType.ENUM('SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'),
  })
  dia_semana: string;

  @Column({ type: DataType.TIME })
  hora: string;

  @Column({ type: DataType.TINYINT, defaultValue: 1 })
  disponivel: number;

  @BelongsTo(() => Agente)
  agente: Agente;
}
