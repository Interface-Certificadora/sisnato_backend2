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

export class UpdateAlertDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Descrição da alerta',
    example: 'Descrição da alerta',
  })
  @IsString({ message: 'Descrição deve ser uma string válida' })
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'ID da solicitação',
    example: 1,
    nullable: true,
  })
  @IsNumber({}, { message: 'ID da solicitação deve ser um número válido' })
  @IsPositive({ message: 'ID da solicitação deve ser um número válido' })
  @IsOptional()
  solicitacao_id?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'ID do corretor',
    example: 1,
    nullable: true,
  })
  @IsNumber({}, { message: 'ID do corretor deve ser um número válido' })
  @IsPositive({ message: 'ID do corretor deve ser um número válido' })
  @IsOptional()
  corretor_id?: number | null;

  @ApiProperty({
    type: Boolean,
    required: false,
    description: 'Status da alerta',
    example: false,
  })
  @IsBoolean({ message: 'Status deve ser "true" ou "false"' })
  @IsOptional()
  status?: boolean;
}
