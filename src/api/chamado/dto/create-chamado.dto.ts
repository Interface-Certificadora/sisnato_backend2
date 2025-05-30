import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';
import { TimelineDto } from './timeline.dto';

export class CreateChamadoDto {
  @ApiProperty({
    example: 'Departamento',
    description: 'Departamento do chamado',
    required: true,
  })
  @IsString()
  departamento: string;

  @ApiProperty({
    example: 'Prioridade',
    description: 'Prioridade do chamado',
    required: true,
  })
  @IsString()
  prioridade: string;

  @ApiProperty({
    example: 'Data e hora da queixa',
    description: 'Data e hora da queixa',
    required: true,
  })
  @IsString()
  dth_qru: string;

  @ApiProperty({
    example: 'Descrição',
    description: 'Descrição do chamado',
    required: true,
  })
  @IsString()
  descricao: string;

  @ApiProperty({
    example: 'Status',
    description: 'Status do chamado',
    required: true,
  })
  @IsString()
  status: string;

  @ApiProperty({
    example: 'ID da Solicitação',
    description: 'ID da Solicitação',
    required: true,
  })
  @IsNumber()
  solicitacaoId: number;

  @ApiProperty({
    example: 'ID do Usuário',
    description: 'ID do Usuário',
    required: true,
  })
  @IsNumber()
  idUser: number;

  @ApiProperty({
    example: 'Imagens',
    description: 'Imagens do chamado',
    required: true,
  })
  @IsArray()
  images: any[];

  @ApiProperty({
    example: '{"status": "Em andamento", "descricao": "Descrição do chamado"}',
    description: 'linha do tempo',
    required: true,
  })
  temp: Array<TimelineDto>;
}
