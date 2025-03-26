import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

/**
 * Data Transfer Object (DTO) para criar uma nova Solicitação.
 *
 * @typedef {Object} CreateSolicitacaoDto
 * @property {string} nome - Nome da Solicitação (obrigatório)
 * @property {string} email - E-mail da Solicitação (obrigatório)
 * @property {string} cpf - CPF da Solicitação (obrigatório, transformado para remover caracteres não numéricos)
 * @property {string} [telefone] - Telefone da Solicitação (opcional, transformado para remover caracteres não numéricos)
 * @property {string} [telefone2] - Telefone 2 da Solicitação (opcional, transformado para remover caracteres não numéricos)
 * @property {Date} [dt_nascimento] - Data de nascimento da Solicitação (opcional)
 * @property {number} [id_fcw] - ID do FCW da Solicitação (opcional, número positivo)
 * @property {string} [obs] - Observação da Solicitação (opcional)
 * @property {string} [cnh] - CNH da Solicitação (opcional)
 * @property {boolean} [ativo] - Se a Solicitação está ativa (opcional)
 * @property {string} [uploadCnh] - URL da imagem da CNH da Solicitação (opcional)
 * @property {string} [uploadRg] - URL da imagem do RG da Solicitação (opcional)
 * @property {Object[]} [relacionamentos] - Relacionamentos da Solicitação (opcional, array de objetos)
 * @property {boolean} [rela_quest] - Se a Solicitação tem relacionamento com outra Solicitação (opcional)
 * @property {boolean} [distrato] - Se a Solicitação foi distratada (opcional)
 * @property {Date} [dt_distrato] - Data de distrato da Solicitação (opcional)
 * @property {boolean} [status_aprovacao] - Status de aprovação da Solicitação (opcional)
 * @property {number} [distrato_id] - ID do distrato da Solicitação (opcional, número positivo)
 * @property {string} [andamento] - Andamento da Solicitação (opcional)
 * @property {string} [type_validacao] - Tipo de validação da Solicitação (opcional)
 * @property {Date} [dt_aprovacao] - Data de aprovação da Solicitação (opcional)
 * @property {string} [hr_aprovacao] - Hora de aprovação da Solicitação (opcional)
 * @property {Date} [dt_agendamento] - Data de agendamento da Solicitação (opcional)
 * @property {string} [hr_agendamento] - Hora de agendamento da Solicitação (opcional)
 * @property {string} [estatos_pgto] - Status de pagamento da Solicitação (opcional)
 * @property {number} [valorcd] - Valor de pagamento da Solicitação (opcional, número positivo)
 * @property {string} [situacao_pg] - Situação de pagamento da Solicitação (opcional)
 * @property {number} [freqSms] - Frequência de envio de SMS (opcional, número positivo)
 * @property {boolean} [alertanow] - Se a Solicitação tem alerta (opcional)
 * @property {Date} [dt_criacao_now] - Data de criação da Solicitação (opcional)
 * @property {string} [statusAtendimento] - Status de atendimento da Solicitação (opcional)
 * @property {boolean} [pause] - Se a Solicitação está pausada (opcional)
 * @property {number} [corretor] - ID do corretor da Solicitação (opcional, número positivo)
 * @property {number} [construtora] - ID da construtora da Solicitação (opcional, número positivo)
 * @property {number} [financeiro] - ID do financeiro da Solicitação (opcional, número positivo)
 * @property {number} [empreendimento] - ID do empreendimento da Solicitação (opcional, número positivo)

 */
export class CreateSolicitacaoDto {
  @ApiProperty({
    required: true,
    example: 'Solicitação 1',
    description: 'Nome da solicitação',
    type: String,
  })
  @IsString({ message: 'nome deve ser uma string' })
  @IsNotEmpty({ message: 'nome não pode ser vazio' })
  nome: string;

  @ApiProperty({
    required: true,
    example: 'solicitaccao@exemplo.com',
    description: 'Email da solicitação',
    type: String,
  })
  @IsString({ message: 'email deve ser uma string' })
  @IsNotEmpty({ message: 'email não pode ser vazio' })
  email: string;

  @ApiProperty({
    required: true,
    example: '123.456.789-00',
    description: 'CPF da solicitação',
    type: String,
  })
  @IsString({ message: 'cpf deve ser uma string' })
  @IsNotEmpty({ message: 'cpf não pode ser vazio' })
  @Transform(({ value }) => value.replace(/\D/g, ''))
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
  telefone2: string;

  @ApiProperty({
    required: false,
    example: '2025-01-01',
    description: 'Data de nascimento da solicitação',
    type: Date,
  })
  @IsOptional()
  @IsDate({ message: 'dt_nascimento deve ser uma data' })
  @Transform(({ value }) => new Date(value).toISOString())
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
  id_fcw: number;

  @ApiProperty({
    required: false,
    example: 'Observação da solicitação',
    description: 'Observação da solicitação',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'obs deve ser uma string' })
  obs: string;

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
    type: String,
  })
  @IsString({ message: 'uploadCnh deve ser uma string' })
  @IsOptional()
  uploadCnh: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/rg.jpg',
    description: 'URL da imagem do RG da solicitação',
    type: String,
  })
  @IsString({ message: 'uploadRg deve ser uma string' })
  @IsOptional()
  uploadRg: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'A solicitação possui relação com outra solicitação',
    type: Boolean,
  })
  @IsBoolean({ message: 'rela_quest deve ser um booleano' })
  @IsOptional()
  rela_quest: boolean;

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
  @Transform(({ value }) => new Date(value).toISOString())
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
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  dt_aprovacao: Date;

  @ApiProperty({
    required: false,
    example: '10:00',
    description: 'Hora de aprovação da solicitação',
    type: String,
  })
  @IsString({ message: 'hr_aprovacao deve ser uma string' })
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  hr_aprovacao: string;

  @ApiProperty({
    required: false,
    example: '2023-01-01',
    description: 'Data de agendamento da solicitação',
    type: Date,
  })
  @IsDate({ message: 'dt_agendamento deve ser uma data' })
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  dt_agendamento: Date;

  @ApiProperty({
    required: false,
    example: '10:00',
    description: 'Hora de agendamento da solicitação',
    type: String,
  })
  @IsString({ message: 'hr_agendamento deve ser uma string' })
  @Transform(({ value }) => new Date(value).toISOString())
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
}

// @ApiProperty({
//   required: false,
//   example: ['123.456.789-00', '987.654.321-00'],
//   description: 'Relacionamentos da solicitação',
//   type: [Object],
// })
// @IsArray({ message: 'relacionamentos deve ser um array' })
// @IsOptional()
// relacionamentos: object[];
