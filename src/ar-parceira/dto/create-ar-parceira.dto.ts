import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArParceiraDto {
  @ApiProperty({
    description: 'Nome da AR Parceira',
    example: 'AR SOLUTI CENTRO',
  })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'ID da Cidade (Relacionamento)',
    example: 450,
  })
  @IsInt()
  cidadeId: number;

  @ApiProperty({
    description: 'Autoridade Certificadora (AC)',
    example: 'SOLUTI',
    required: false,
  })
  @IsString()
  @IsOptional()
  ac?: string;

  @ApiProperty({
    description: 'Status da parceira (Ativa/Inativa)',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    description: 'Nome do responsável',
    required: false,
  })
  @IsString()
  @IsOptional()
  responsavel?: string;

  @ApiProperty({
    description: 'Telefone de contato',
    required: false,
  })
  @IsString()
  @IsOptional()
  telefone?: string;

  @ApiProperty({
    description: 'Valor cobrado ou tipo (VOUCHER)',
    required: false,
  })
  @IsString()
  @IsOptional()
  valor?: string;

  @ApiProperty({
    description: 'Endereço completo',
    required: false,
  })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({
    description: 'Observações gerais',
    required: false,
  })
  @IsString()
  @IsOptional()
  obs?: string;

  @ApiProperty({
    description: 'Latitude (Opcional, se diferente da cidade)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude (Opcional, se diferente da cidade)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
