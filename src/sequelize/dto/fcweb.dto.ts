import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class FcwebDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  s_alerta: string;

  @IsString()
  @IsOptional()
  referencia: string;

  @IsNumber()
  @IsOptional()
  id_boleto: number;

  @IsNumber()
  @IsOptional()
  id_cancelar_bol_rem: number;

  @IsString()
  @IsOptional()
  unidade: string;

  @IsString()
  @IsOptional()
  responsavel: string;

  @IsString()
  @IsOptional()
  criou_fc: string;

  @IsString()
  @IsOptional()
  andamento: string;

  @IsString()
  @IsOptional()
  prioridade: string;

  @IsString()
  @IsOptional()
  solicitacao: string;

  @IsString()
  @IsOptional()
  venda: string;

  @IsString()
  @IsOptional()
  cpf: string;

  @IsString()
  @IsOptional()
  cnpj: string;

  @IsString()
  @IsOptional()
  nome: string;

  @IsString()
  @IsOptional()
  razaosocial: string;

  @IsDate()
  @IsOptional()
  vectoboleto: Date;

  @IsString()
  @IsOptional()
  unico: string;

  @IsString()
  @IsOptional()
  contador: string;

  @IsString()
  @IsOptional()
  obscont: string;

  @IsNumber()
  @IsOptional()
  comissaoparceiro: number;

  @IsString()
  @IsOptional()
  scp: string;

  @IsString()
  @IsOptional()
  tipocd: string;

  @IsString()
  @IsOptional()
  valorcd: string;

  @IsString()
  @IsOptional()
  custocd: string;

  @IsString()
  @IsOptional()
  custoCdpar: string;

  @IsString()
  @IsOptional()
  estatos_pgto: string;

  @IsString()
  @IsOptional()
  pgto_efi: string;

  @IsString()
  @IsOptional()
  formapgto: string;

  @IsString()
  @IsOptional()
  vouchersoluti: string;

  @IsString()
  @IsOptional()
  ct_parcela: string;

  @IsString()
  @IsOptional()
  telefone: string;

  @IsString()
  @IsOptional()
  telefone2: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsDate()
  @IsOptional()
  dtnascimento: Date;

  @IsString()
  @IsOptional()
  rg: string;

  @IsString()
  @IsOptional()
  cei: string;

  @IsString()
  @IsOptional()
  endereco: string;

  @IsString()
  @IsOptional()
  nrua: string;

  @IsString()
  @IsOptional()
  bairro: string;

  @IsString()
  @IsOptional()
  complemento: string;

  @IsString()
  @IsOptional()
  cep: string;

  @IsString()
  @IsOptional()
  uf: string;

  @IsNumber()
  @IsOptional()
  im: number;

  @IsString()
  @IsOptional()
  cidade: string;

  @IsString()
  @IsOptional()
  observacao: string;

  @IsDate()
  @IsOptional()
  vctoCD: Date;

  @IsString()
  @IsOptional()
  historico: string;

  @IsString()
  @IsOptional()
  arquivo: string;

  @IsString()
  @IsOptional()
  nomearquivo: string;

  @IsString()
  @IsOptional()
  obsrenovacao: string;

  @IsDate()
  @IsOptional()
  dt_aprovacao: Date;

  @IsString()
  @IsOptional()
  hr_aprovacao: string;

  @IsNumber()
  @IsOptional()
  comicao: number;

  @IsString()
  @IsOptional()
  validacao: string;

  @IsString()
  @IsOptional()
  nfe: string;

  @IsString()
  @IsOptional()
  urlnota: string;

  @IsString()
  @IsOptional()
  id_fcw_soluti: string;

  @IsDate()
  @IsOptional()
  dt_agenda: Date;

  @IsString()
  @IsOptional()
  hr_agenda: string;

  @IsString()
  @IsOptional()
  obs_agenda: string;

  @IsString()
  @IsOptional()
  reg_cnh: string;

  @IsDate()
  @IsOptional()
  dt_revoacao: Date;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  @IsOptional()
  updatedAt: Date;
}
