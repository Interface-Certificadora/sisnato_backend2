import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ 
  tableName: 'fcweb', 
  timestamps: false
})
export class Fcweb extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  s_alerta: string;

  @Column({ type: DataType.STRING, allowNull: false })
  referencia: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  id_boleto: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  id_cancelar_bol_rem: number;

  @Column({ type: DataType.STRING, allowNull: false })
  unidade: string;

  @Column({ type: DataType.STRING, allowNull: false })
  responsavel: string;

  @Column({ type: DataType.STRING, allowNull: false })
  criou_fc: string;

  @Column({ type: DataType.STRING, allowNull: false })
  andamento: string;

  @Column({ type: DataType.STRING, allowNull: false })
  prioridade: string;

  @Column({ type: DataType.STRING, allowNull: false })
  solicitacao: string;

  @Column({ type: DataType.STRING, allowNull: false })
  venda: string;

  @Column({ type: DataType.STRING, allowNull: false })
  cpf: string;

  @Column({ type: DataType.STRING, allowNull: false })
  cnpj: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nome: string;

  @Column({ type: DataType.STRING, allowNull: false })
  razaosocial: string;

  @Column({ type: DataType.DATE, allowNull: false })
  vectoboleto: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  unico: string;

  @Column({ type: DataType.STRING, allowNull: false })
  contador: string;

  @Column({ type: DataType.STRING, allowNull: false })
  obscont: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  comissaoparceiro: number;

  @Column({ type: DataType.STRING, allowNull: false })
  scp: string;

  @Column({ type: DataType.STRING, allowNull: false })
  tipocd: string;

  @Column({ type: DataType.STRING, allowNull: false })
  valorcd: string;

  @Column({ type: DataType.STRING, allowNull: false })
  custocd: string;

  @Column({ type: DataType.STRING, allowNull: false })
  custoCdpar: string;

  @Column({ type: DataType.STRING, allowNull: false })
  estatos_pgto: string;

  @Column({ type: DataType.STRING, allowNull: false })
  pgto_efi: string;

  @Column({ type: DataType.STRING, allowNull: false })
  formapgto: string;

  @Column({ type: DataType.STRING, allowNull: false })
  vouchersoluti: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ct_parcela: string;

  @Column({ type: DataType.STRING, allowNull: false })
  telefone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  telefone2: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.DATE, allowNull: false })
  dtnascimento: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  rg: string;

  @Column({ type: DataType.STRING, allowNull: false })
  cei: string;

  @Column({ type: DataType.STRING, allowNull: false })
  endereco: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nrua: string;

  @Column({ type: DataType.STRING, allowNull: false })
  bairro: string;

  @Column({ type: DataType.STRING, allowNull: false })
  complemento: string;

  @Column({ type: DataType.STRING, allowNull: false })
  cep: string;

  @Column({ type: DataType.STRING, allowNull: false })
  uf: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  im: number;

  @Column({ type: DataType.STRING, allowNull: false })
  cidade: string;

  @Column({ type: DataType.STRING, allowNull: false })
  observacao: string;

  @Column({ type: DataType.DATE, allowNull: false })
  vctoCD: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  historico: string;

  @Column({ type: DataType.STRING, allowNull: false })
  arquivo: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nomearquivo: string;

  @Column({ type: DataType.STRING, allowNull: false })
  obsrenovacao: string;

  @Column({ type: DataType.DATE, allowNull: false })
  dt_aprovacao: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  hr_aprovacao: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  comicao: number;

  @Column({ type: DataType.STRING, allowNull: false })
  validacao: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nfe: string;

  @Column({ type: DataType.STRING, allowNull: false })
  urlnota: string;

  @Column({ type: DataType.STRING, allowNull: false })
  id_fcw_soluti: string;

  @Column({ type: DataType.DATE, allowNull: false })
  dt_agenda: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  hr_agenda: string;

  @Column({ type: DataType.STRING, allowNull: false })
  obs_agenda: string;

  @Column({ type: DataType.STRING, allowNull: false })
  reg_cnh: string;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;
}
