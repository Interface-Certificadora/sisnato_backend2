import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Agente } from './agente.model';

@Table({ tableName: 'agente_modalidade', timestamps: false })
export class AgenteModalidade extends Model<AgenteModalidade> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => Agente)
  @Column({ type: DataType.INTEGER })
  agente_id: number;

  @Column({ type: DataType.STRING })
  modalidade: string; // Ex: 'VIDEO CONF'

  @BelongsTo(() => Agente)
  agente: Agente;
}
