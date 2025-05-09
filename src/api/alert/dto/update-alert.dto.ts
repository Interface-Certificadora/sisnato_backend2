import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { CreateAlertDto } from './create-alert.dto';

export class UpdateAlertDto extends PartialType(CreateAlertDto) {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Título da alerta',
    example: 'Título da alerta',
  })
  @IsString({ message: 'Título deve ser uma string válida' })
  @IsOptional()
  titulo: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Descrição da alerta',
    example: 'Descrição da alerta',
  })
  @IsString({ message: 'Descrição deve ser uma string válida' })
  @IsOptional()
  texto: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'ID da solicitação',
    example: 1,
  })
  @IsNumber({}, { message: 'ID da solicitação deve ser um número válido' })
  @IsPositive({ message: 'ID da solicitação deve ser um número válido' })
  @IsOptional()
  solicitacao_id: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'ID do corretor',
    example: 1,
  })
  @IsNumber({}, { message: 'ID do corretor deve ser um número válido' })
  @IsPositive({ message: 'ID do corretor deve ser um número válido' })
  @IsOptional()
  corretor: number;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Tipo da alerta define qual vai receber a notificação',
    example: 'CORRETOR',
  })
  @IsString({ message: 'Tipo deve ser uma string válida' })
  @IsOptional()
  tipo: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Tag da alerta podendo ser warning, info ou error',
    example: 'tag',
  })
  @IsString({ message: 'Tag deve ser uma string válida' })
  @IsOptional()
  tag: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'ID do empreendimento',
    example: 1,
  })
  @IsNumber({}, { message: 'ID do empreendimento deve ser um número válido' })
  @IsPositive({ message: 'ID do empreendimento deve ser um número válido' })
  @IsOptional()
  empreendimento: number;

  @ApiProperty({
    type: Boolean,
    required: false,
    description: 'Status da alerta',
    example: false,
  })
  @IsBoolean({ message: 'Status deve ser "true" ou "false"' })
  @IsOptional()
  status: boolean;
}
