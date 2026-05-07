import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'fcweb_reagendamentos', // Nome exato da tabela no banco
  timestamps: false,
})
export class FcwebReagendamento extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  id_fcweb: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  data_reagenda: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  hora_reagenda: string;

  @Column({ type: DataType.TEXT })
  motivo: string;

  @Column({ type: DataType.STRING(100) })
  criado_por: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  criado_em: Date;
}
