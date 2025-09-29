import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateIntelesignDto {
  @ApiProperty({
    description: 'Array de IDs dos signatários',
    example: '[]',
    required: false,
    type: () => [String],
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  signatarios: SignatarioDto[];

  @ApiProperty({
    description: 'Valor do documento',
    example: 100.0,
    required: true,
    default: 15.0,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    {},
    {
      message: 'Valor deve ser um número',
    },
  )
  valor: number;

  @ApiProperty({
    description: 'ID do CCA',
    example: '1',
    required: false,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    {},
    {
      message: 'CCA_ID deve ser um número',
    },
  )
  cca_id?: number;
}


export class SignatarioDto {
  @ApiProperty({
    description: 'ID do signatário',
    example: '1',
    required: true,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    {},
    {
      message: 'ID deve ser um número',
    },
  )
  id: number;

  @ApiProperty({
    description: 'Tipo de assinatura',
    example: 'simple || qualified',
    required: true,
    enum: ['simple', 'qualified'],
    type: () => String,
  })
  @IsString({
    message: 'AssType deve ser uma string',
  })
  @IsEnum(['simple', 'qualified'], {
    message: 'AssType deve ser simple ou qualified',
  })
  asstype: string;

  @ApiProperty({
    description: 'Tipo de destinatário',
    example: 'signer || approver || carbon-copy',
    required: true,
    enum: ['signer', 'approver', 'carbon-copy'],
    type: () => String,
  })
  @IsEnum(['signer', 'approver', 'carbon-copy'], {
    message: 'Type deve ser signer, approver ou carbon-copy',
  })
  @IsString({
    message: 'Type deve ser uma string',
  })
  type: string;
}
