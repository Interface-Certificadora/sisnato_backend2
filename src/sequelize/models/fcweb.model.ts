import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'fcweb',
  timestamps: false, // Como você gerencia manualmente ou via hooks, mantemos igual
})
export class Fcweb extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  s_alerta: string;

  @Column({ type: DataType.STRING, allowNull: true })
  referencia: string;

  @Column({ type: DataType.STRING, allowNull: true }) // Alterado para STRING baseado no seu DTO antigo e DBeaver
  id_boleto: string;

  @Column({ type: DataType.STRING, allowNull: true }) // Alterado para STRING baseado no seu DTO antigo e DBeaver
  id_cancelar_bol_rem: string;

  @Column({ type: DataType.STRING, allowNull: true })
  unidade: string;

  @Column({ type: DataType.STRING, allowNull: true })
  responsavel: string;

  @Column({ type: DataType.STRING, allowNull: false }) // Obrigatório no DBeaver [v]
  criou_fc: string;

  @Column({ type: DataType.STRING, allowNull: true })
  andamento: string;

  @Column({ type: DataType.STRING, allowNull: true })
  prioridade: string;

  @Column({ type: DataType.STRING, allowNull: true })
  solicitacao: string;

  @Column({ type: DataType.STRING, allowNull: true })
  venda: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cpf: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cnpj: string;

  @Column({ type: DataType.STRING, allowNull: true })
  nome: string;

  @Column({ type: DataType.STRING, allowNull: true })
  razaosocial: string;

  @Column({ type: DataType.DATE, allowNull: true })
  vectoboleto: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  unico: string;

  @Column({ type: DataType.STRING, allowNull: true })
  contador: string;

  @Column({ type: DataType.STRING, allowNull: true })
  obscont: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  comissaoparceiro: number;

  @Column({ type: DataType.STRING, allowNull: true })
  scp: string;

  @Column({ type: DataType.STRING, allowNull: true })
  tipocd: string;

  @Column({ type: DataType.STRING, allowNull: true })
  valorcd: string;

  @Column({ type: DataType.STRING, allowNull: true })
  custocd: string;

  @Column({ type: DataType.STRING, allowNull: true })
  custoCdpar: string;

  @Column({ type: DataType.STRING, allowNull: true })
  estatos_pgto: string;

  @Column({ type: DataType.STRING, allowNull: true })
  pgto_efi: string;

  @Column({ type: DataType.STRING, allowNull: true })
  formapgto: string;

  @Column({ type: DataType.STRING, allowNull: true })
  vouchersoluti: string;

  @Column({ type: DataType.STRING, allowNull: true })
  ct_parcela: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telefone: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telefone2: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true }) // Mantido como STRING para casar com o formato do DTO
  dtnascimento: string;

  @Column({ type: DataType.STRING, allowNull: true })
  rg: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cei: string;

  @Column({ type: DataType.STRING, allowNull: true })
  endereco: string;

  @Column({ type: DataType.STRING, allowNull: true })
  nrua: string;

  @Column({ type: DataType.STRING, allowNull: true })
  bairro: string;

  @Column({ type: DataType.STRING, allowNull: true })
  complemento: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cep: string;

  @Column({ type: DataType.STRING, allowNull: true })
  uf: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  im: number;

  @Column({ type: DataType.STRING, allowNull: true })
  cidade: string;

  @Column({ type: DataType.TEXT, allowNull: true }) // DBeaver acusa longtext/text
  observacao: string;

  @Column({ type: DataType.DATE, allowNull: true })
  vctoCD: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  historico: string;

  @Column({ type: DataType.STRING, allowNull: true })
  arquivo: string;

  @Column({ type: DataType.STRING, allowNull: true })
  nomearquivo: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  obsrenovacao: string;

  @Column({ type: DataType.DATE, allowNull: true })
  dt_aprovacao: Date;

  @Column({ type: DataType.TIME, allowNull: true })
  hr_aprovacao: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  comicao: number;

  @Column({ type: DataType.STRING, allowNull: true })
  validacao: string;

  @Column({ type: DataType.STRING, allowNull: true })
  nfe: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  urlnota: string;

  @Column({ type: DataType.STRING, allowNull: true })
  id_fcw_soluti: string;

  @Column({ type: DataType.DATE, allowNull: true })
  dt_agenda: Date;

  @Column({ type: DataType.TIME, allowNull: true })
  hr_agenda: string;

  @Column({ type: DataType.STRING, allowNull: true })
  obs_agenda: string;

  @Column({ type: DataType.STRING, allowNull: true })
  reg_cnh: string;

  // --- CORRIGIDO NOME ORTOGRÁFICO DA COLUNA DA LINHA 69 DA PRINT ---
  @Column({ field: 'dt_revogacao', type: DataType.DATE, allowNull: true })
  dt_revogacao: Date;

  // --- CAMPOS ADICIONAIS EXIGIDOS PELO SEU IMPORTDATA/DBEAVER ---
  @Column({ type: DataType.STRING, allowNull: false })
  solicitacao_trial: string;

  @Column({ type: DataType.STRING, allowNull: false })
  andamento_trial: string;

  @Column({ type: DataType.STRING, allowNull: false })
  vencimento_trial: string;

  @Column({ type: DataType.STRING, allowNull: false })
  reagendamento: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  status_renovacao: number;

  @Column({ type: DataType.DATE, allowNull: false }) // Linha 66 da print [v]
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: Date;
}
