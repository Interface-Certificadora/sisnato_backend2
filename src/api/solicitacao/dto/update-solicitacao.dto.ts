import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitacaoDto } from './create-solicitacao.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MaxLength, MinLength } from 'class-validator';
import { FileUrlDto } from './fileurl.dto';

export class UpdateSolicitacaoDto {
  @ApiProperty({
    required: true,
    example: 'https://example.com/solicitacao',
    description: 'URL da solicitação',
    type: String,
  })
  @IsString({ message: 'url deve ser uma string' })
  @IsOptional()
  url: string;

  @ApiProperty({
    required: true,
    example: 'Solicitação 1',
    description: 'Nome da solicitação',
    type: String,
  })
  @IsString({ message: 'nome deve ser uma string' })
  @IsNotEmpty({ message: 'nome não pode ser vazio' })
  @IsOptional()
  nome: string;

  @ApiProperty({
    required: true,
    example: 'solicitaccao@exemplo.com',
    description: 'Email da solicitação',
    type: String,
  })
  @IsString({ message: 'email deve ser uma string' })
  @IsNotEmpty({ message: 'email não pode ser vazio' })
  @IsOptional()
  email: string;

  @ApiProperty({
    required: true,
    example: '123.456.789-00',
    description: 'CPF da solicitação',
    type: String,
  })
  @IsString({ message: 'cpf deve ser uma string' })
  @IsNotEmpty({ message: 'cpf não pode ser vazio' })
  @IsOptional()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @MaxLength(11, { message: 'cpf deve ter no máximo 11 dígitos' })
  @MinLength(11, { message: 'cpf deve ter no mínimo 11 dígitos' })
  cpf: string;

  @ApiProperty({
    required: false,
    example: '(11) 99999-9999',
    description: 'Telefone da solicitação',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'telefone deve ser uma string' })
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @IsOptional()
  telefone: string;

  @ApiProperty({
    required: false,
    example: '(11) 99999-9999',
    description: 'Telefone 2 da solicitação',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'telefone2 deve ser uma string' })
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @IsOptional()
  telefone2: string;

  @ApiProperty({
    required: false,
    example: '2025-01-01',
    description: 'Data de nascimento da solicitação',
    type: Date,
  })
  @IsOptional()
  @IsDate({ message: 'dt_nascimento deve ser uma data' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  dt_nascimento: Date;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID da FCW da solicitação',
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'id_fcw deve ser um número' })
  @IsPositive({ message: 'id_fcw deve ser um número positivo' })
  @IsOptional()
  id_fcw: number;

  @ApiProperty({
    required: false,
    example: 'Observação da solicitação',
    description: 'Observação da solicitação',
    type: Object,
  })
  @IsOptional()
  @IsArray({ message: 'obs deve ser um array' })
  @IsOptional()
  obs: [object];

  @ApiProperty({
    required: false,
    example: '123456789',
    description: 'CNH da solicitação',
    type: String,
  })
  @IsString({ message: 'cnh deve ser uma string' })
  @IsOptional()
  cnh: string;

  @ApiProperty({
    required: false,
    example: 'true',
    description: 'Ativo da solicitação',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'ativo deve ser um booleano' })
  ativo: boolean;

  @ApiProperty({
    required: false,
    example: 'https://example.com/cnh.jpg',
    description: 'URL da imagem da CNH da solicitação',
    type: FileUrlDto,
  })
  @IsOptional()
  uploadCnh: FileUrlDto;

  @ApiProperty({
    required: false,
    example: 'https://example.com/rg.jpg',
    description: 'URL da imagem do RG da solicitação',
    type: FileUrlDto,
  })
  @IsOptional()
  uploadRg: FileUrlDto;

  // @ApiProperty({
  //   required: false,
  //   example: true,
  //   description: 'A solicitação possui relação com outra solicitação',
  //   type: Boolean,
  // })
  // @IsBoolean({ message: 'rela_quest deve ser um booleano' })
  // @IsOptional()
  // rela_quest: boolean;

  @ApiProperty({
    required: false,
    example: true,
    description: 'A solicitação foi distratada',
    type: Boolean,
  })
  @IsBoolean({ message: 'distrato deve ser um booleano' })
  @IsOptional()
  distrato: boolean;

  @ApiProperty({
    required: false,
    example: '2023-01-01',
    description: 'Data de distrato da solicitação',
    type: Date,
  })
  @IsDate({ message: 'dt_distrato deve ser uma data' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  dt_distrato: Date;

  @ApiProperty({
    required: false,
    example: true,
    description: 'A solicitação foi aprovada',
    type: Boolean,
  })
  @IsBoolean({ message: 'status_aprovacao deve ser um booleano' })
  @IsOptional()
  status_aprovacao: boolean;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID do distrato da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'distrato_id deve ser um número' })
  @IsOptional()
  distrato_id: number;

  @ApiProperty({
    required: false,
    example: 'Em andamento',
    description: 'Andamento da solicitação',
    type: String,
  })
  @IsString({ message: 'andamento deve ser uma string' })
  @IsOptional()
  andamento: string;

  @ApiProperty({
    required: false,
    example: 'type_validacao',
    description: 'Tipo de validação da solicitação',
    type: String,
  })
  @IsString({ message: 'type_validacao deve ser uma string' })
  @IsOptional()
  type_validacao: string;

  @ApiProperty({
    required: false,
    example: '2023-01-01',
    description: 'Data de aprovação da solicitação',
    type: Date,
  })
  @IsDate({ message: 'dt_aprovacao deve ser uma data' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  dt_aprovacao: Date;

  @ApiProperty({
    required: false,
    example: '10:00',
    description: 'Hora de aprovação da solicitação',
    type: String,
  })
  @IsString({ message: 'hr_aprovacao deve ser uma string' })
  // @Transform(({ value }) => new Date(value))
  @IsOptional()
  hr_aprovacao: string;

  @ApiProperty({
    required: false,
    example: '2023-01-01',
    description: 'Data de agendamento da solicitação',
    type: Date,
  })
  @IsDate({ message: 'dt_agendamento deve ser uma data' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  dt_agendamento: Date;

  @ApiProperty({
    required: false,
    example: '10:00',
    description: 'Hora de agendamento da solicitação',
    type: String,
  })
  @IsString({ message: 'hr_agendamento deve ser uma string' })
  // @Transform(({ value }) => new Date(value))
  @IsOptional()
  hr_agendamento: Date;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Id do corretor da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'corretor deve ser um número' })
  @IsPositive({ message: 'corretor deve ser um número positivo' })
  @IsOptional()
  corretor: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Id da construtora da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'construtora deve ser um número' })
  @IsPositive({ message: 'construtora deve ser um número positivo' })
  @IsOptional()
  construtora: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Id do financeiro da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'financeiro deve ser um número' })
  @IsPositive({ message: 'financeiro deve ser um número positivo' })
  @IsOptional()
  financeiro: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Id do empreendimento da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'empreendimento deve ser um número' })
  @IsPositive({ message: 'empreendimento deve ser um número positivo' })
  @IsOptional()
  empreendimento: number;

  @ApiProperty({
    required: false,
    example: 'pendente',
    description: 'Estado do pagamento da solicitação',
    type: String,
  })
  @IsString({ message: 'estatos_pgto deve ser uma string' })
  @IsOptional()
  estatos_pgto: string;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Valor do CD da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'valorcd deve ser um número' })
  @IsOptional()
  valorcd: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Situação do pagamento da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'situacao_pg deve ser um número' })
  @IsOptional()
  situacao_pg: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Frequência de SMS da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'freqSms deve ser um número' })
  @IsOptional()
  freqSms: number;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Alerta NOW da solicitação',
    type: Boolean,
  })
  @IsBoolean({ message: 'alertanow deve ser um booleano' })
  @IsOptional()
  alertanow: boolean;

  @ApiProperty({
    required: false,
    example: '2023-01-01',
    description: 'Data de criação NOW da solicitação',
    type: Date,
  })
  @IsString({ message: 'dt_criacao_now deve ser uma data' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  dt_criacao_now: Date;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Status de atendimento da solicitação',
    type: Boolean,
  })
  @IsBoolean({ message: 'statusAtendimento deve ser um booleano' })
  @IsOptional()
  statusAtendimento: boolean;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Pause da solicitação',
    type: Boolean,
  })
  @IsBoolean({ message: 'pause deve ser um booleano' })
  @IsOptional()
  pause: boolean;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID do corretor da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'corretorId deve ser um número' })
  @IsOptional()
  corretorId: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID da construtora da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'construtoraId deve ser um número' })
  @IsOptional()
  construtoraId: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID do financeiro da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'financeiroId deve ser um número' })
  @IsOptional()
  financeiroId: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID do empreendimento da solicitação',
    type: Number,
  })
  @IsNumber({}, { message: 'empreendimentoId deve ser um número' })
  @IsOptional()
  empreendimentoId: number;

  @ApiProperty({
    required: false,
    example: '2023-01-01',
    description: 'Data de revogação da solicitação',
    type: Date,
  })
  @IsString({ message: 'dt_revogacao deve ser uma data do tipo ISO' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  dt_revogacao: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Solicitação direta',
    type: Boolean,
  })
  @IsBoolean({ message: 'direto deve ser um booleano' })
  @IsOptional()
  direto: boolean;

  @ApiProperty({
    required: false,
    example: 'txid',
    description: 'ID da transação',
    type: String,
  })
  @IsString({ message: 'txid deve ser uma string' })
  @IsOptional()
  txid: string;

  @ApiProperty({
    required: false,
    example: 'pixCopiaECola',
    description: 'Copia e cola do PIX',
    type: String,
  })
  @IsString({ message: 'pixCopiaECola deve ser uma string' })
  @IsOptional()
  pixCopiaECola: string;

  @ApiProperty({
    required: false,
    example: 'imagemQrcode',
    description: 'Imagem do QRCODE',
    type: String,
  })
  @IsString({ message: 'imagemQrcode deve ser uma string' })
  @IsOptional()
  imagemQrcode: string;

  @ApiProperty({
    required: false,
    example: 'pg_andamento',
    description: 'Andamento do pagamento',
    type: String,
  })
  @IsString({ message: 'pg_andamento deve ser uma string' })
  @IsOptional()
  pg_andamento: string;

  @ApiProperty({
    required: false,
    example: 'pg_date',
    description: 'Data do pagamento',
    type: String,
  })
  @IsString({ message: 'pg_date deve ser uma string' })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  pg_date: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Status do pagamento',
    type: Boolean,
  })
  @IsBoolean({ message: 'pg_status deve ser um booleano' })
  @IsOptional()
  pg_status: boolean;

  @ApiProperty({
    description: 'Cliente atendido via app',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'sisapp deve ser true ou false' })
  sisapp?: boolean;
}
