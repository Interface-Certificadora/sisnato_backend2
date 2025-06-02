import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ChatObjectDto } from './chat.bject.dto';
import { CreateChamadoDto } from './create-chamado.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TimelineDto } from './timeline.dto';
import { ObjectImageDto } from './objectimage.dto';

export class UpdateChamadoDto {
  @ApiProperty({
    example: 'Departamento',
    description: 'Departamento do chamado',
    required: true,
  })
  @IsOptional()
  @IsString()
  departamento: string;

  @ApiProperty({
    example: 'Prioridade',
    description: 'Prioridade do chamado',
    required: true,
  })
  @IsOptional()
  @IsString()
  prioridade: string;

  @ApiProperty({
    example: 'Data e hora da queixa',
    description: 'Data e hora da queixa',
    required: true,
  })
  @IsOptional()
  @IsString()
  dth_qru: string;

  @ApiProperty({
    example: 'Descrição',
    description: 'Descrição do chamado',
    required: true,
  })
  @IsOptional()
  @IsString()
  descricao: string;

  @ApiProperty({
    example: 'Status',
    description: 'Status do chamado',
    required: true,
  })
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty({
    example: 'ID da Solicitação',
    description: 'ID da Solicitação',
    required: true,
  })
  @IsOptional()
  @IsNumber()
  solicitacaoId: number;

  @ApiProperty({
    example: 'ID do Usuário',
    description: 'ID do Usuário',
    required: true,
  })
  @IsOptional()
  @IsNumber()
  idUser: number;

  @ApiProperty({
    example: 'Imagens',
    description: 'Imagens do chamado',
    required: true,
  })
  @IsOptional()
  images: ObjectImageDto[];

  @ApiProperty({
    example: '{"status": "Em andamento", "descricao": "Descrição do chamado"}',
    description: 'linha do tempo',
    required: true,
  })
  @IsOptional()
  temp: TimelineDto[];

  @ApiProperty({
    example: 'ID do Usuário',
    description: 'ID do Usuário',
    required: true,
  })
  @IsOptional()
  chat: ChatObjectDto[];
}
