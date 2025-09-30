import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { SignatarioDto } from './sign.dto';

export class CreateIntelesignDto {
  @ApiProperty({
    description: 'Array de signatários',
    example: '[{"nome": "Nome do signatário", "email": "email@exemplo.com", "cpf": "12345678901234"}]',
    required: false,
    type: [SignatarioDto],
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  signatarios?: SignatarioDto[];

  @ApiProperty({
    description: 'Valor do documento',
    example: 100.0,
    required: true,
    default: 15.0,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({
    message: 'Valor do documento é obrigatório',
  })
  valor: number;

  @ApiProperty({
    description: 'ID do CCA',
    example: '1',
    required: false,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  cca_id?: number;

  @ApiProperty({
    description: 'ID do construtora',
    example: '1',
    required: true,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({
    message: 'ID do construtora é obrigatório',
  })
  const_id: number;

  @ApiProperty({
    description: 'Titulo do envelope',
    example: 'Titulo do envelope',
    required: true,
    type: () => String,
  })
  @IsNotEmpty({
    message: 'Titulo do envelope é obrigatório',
  })
  title: string;

  @ApiProperty({
    description: 'Subtitulo do envelope',
    example: 'Subtitulo do envelope',
    required: true,
    type: () => String,
  })
  @IsNotEmpty({
    message: 'Subtitulo do envelope é obrigatório',
  })
  subject: string;

  @ApiProperty({
    description: 'Mensagem do envelope',
    example: 'Mensagem do envelope',
    required: true,
    type: () => String,
  })
  @IsNotEmpty({
    message: 'Mensagem do envelope é obrigatória',
  })
  message: string;

  @ApiProperty({
    description: 'Dias de expiração do envelope',
    example: 7,
    default: 7,
    required: true,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({
    message: 'Dias de expiração do envelope é obrigatório',
  })
  expire_at: number;

  @ApiProperty({
    description: 'Tipo de assinatura utilizada no envelope',
    example: 'simple',
    required: true,
    enum: ['simple', 'qualified'],
    type: () => String,
  })
  @IsNotEmpty({
    message: 'Tipo de assinatura é obrigatório',
  })
  type: string;
}
