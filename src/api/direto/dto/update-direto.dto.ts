import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDiretoDto {
  @ApiProperty({
    description: 'Nome Do cliente',
    example: 'João da Silva',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'nome deve ser uma string',
  })
  nome?: string;

  @ApiProperty({
    description: 'Telefone Do cliente',
    example: '11999999999',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'telefone deve ser uma string',
  })
  telefone?: string;

  @ApiProperty({
    description: 'Telefone Do cliente',
    example: '11999999999',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'telefone deve ser uma string',
  })
  telefone2?: string;

  @ApiProperty({
    description: 'Email Do cliente',
    example: 'qKZV5@example.com',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'email deve ser uma string',
  })
  email?: string;

  @ApiProperty({
    description: 'Data de Nascimento Do cliente',
    example: '2000-01-01',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  dt_nascimento?: Date;

  @ApiProperty({
    description: 'Status Pgto Do cliente',
    example: 'PAGO',
    type: String,
  })
  @IsOptional()
  @IsString({
    message: 'status_pgto deve ser uma string',
  })
  status_pgto?: string;

  // Campos booleanos
  @ApiProperty({
    description: 'Indica se o registro está ativo',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'ativo deve ser booleano' })
  ativo?: boolean;

  @ApiProperty({
    description: 'Indica se há relação de questão',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'rela_quest deve ser booleano' })
  rela_quest?: boolean;

  @ApiProperty({
    description: 'Indica se a solicitação foi distratada',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'distrato deve ser booleano' })
  distrato?: boolean;

  @ApiProperty({
    description: 'Indica aprovação de status',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'status_aprovacao deve ser booleano' })
  status_aprovacao?: boolean;

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
    example: '52394198729',
    description: 'Cpf Do cliente',
    type: String,
  })
  @IsString({
    message: 'cpf deve ser uma string',
  })
  @IsOptional()
  cpf?: string;

  @ApiProperty({
    example: [{ campo: 'valor' }],
    description: 'Observação do cliente',
    type: Array,
    required: false,
  })
  @IsArray({ message: 'obs deve ser um array de objetos' })
  @IsOptional()
  obs?: any[];

  @ApiProperty({
    required: false,
    example: ['123.456.789-00', '987.654.321-00'],
    description: 'Relacionamentos da solicitação',
    type: [String],
  })
  @IsArray({ message: 'relacionamentos deve ser um array' })
  @Transform(({ value }) => {
    for (let i = 0; i < value.length; i++) {
      value[i] = value[i].replace(/\D/g, '');
    }
    return value;
  })
  @IsOptional()
  relacionamentos: string[];

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de agendamento',
    type: String,
  })
  @IsOptional()
  @IsDate({ message: 'dt_agendamento deve ser uma data válida' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  dt_agendamento?: Date;

  @ApiProperty({
    example: '09:00:00',
    description: 'Hora de agendamento',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'hr_agendamento deve ser uma string' })
  hr_agendamento?: string;

  @ApiProperty({
    example: 1500,
    description: 'Valor CD',
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'valorcd deve ser um número' })
  valorcd?: number;

  @ApiProperty({
    example: 12,
    description: 'ID do corretor',
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'corretorId deve ser um número' })
  corretorId?: number;

  @ApiProperty({
    example: 34,
    description: 'ID da construtora',
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'construtoraId deve ser um número' })
  construtoraId?: number;

  @ApiProperty({
    example: 56,
    description: 'ID do financeiro',
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'financeiroId deve ser um número' })
  financeiroId?: number;

  @ApiProperty({
    example: 78,
    description: 'ID do empreendimento',
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'empreendimentoId deve ser um número' })
  empreendimentoId?: number;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de revogação',
    type: String,
  })
  @IsOptional()
  @IsDate({ message: 'dt_revogacao deve ser uma data válida' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  dt_revogacao?: Date;

  @ApiProperty({
    description: 'TXID da transação',
    example: 'abc123',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'txid deve ser uma string' })
  txid?: string;

  @ApiProperty({
    description: 'Código PIX copia e cola',
    example: '00020126330014BR.GOV.BCB.PIX0114+55...',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'pixCopiaECola deve ser uma string' })
  pixCopiaECola?: string;

  @ApiProperty({
    description: 'Imagem do QR Code em base64',
    required: false,
    type: String,
    example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
  })
  @IsOptional()
  @IsString({ message: 'imagemQrcode deve ser uma string' })
  imagemQrcode?: string;

  @ApiProperty({
    description: 'Andamento do pagamento',
    example: 'PENDENTE',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'pg_andamento deve ser uma string' })
  pg_andamento?: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data do pagamento',
    type: String,
  })
  @IsOptional()
  @IsDate({ message: 'pg_date deve ser uma data válida' })
  @Transform(({ value }) => (value ? new Date(value) : null))
  pg_date?: Date;

  @ApiProperty({
    description: 'Status do pagamento',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'pg_status deve ser booleano' })
  pg_status?: boolean;

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
