import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectImageDto } from './objectimage.dto';
import { TimelineDto } from './timeline.dto';

export class CreateChamadoDto {
  @ApiProperty({
    example: 'Titulo',
    description: 'Titulo do chamado',
    required: true,
  })
  @IsString({ message: 'Titulo deve ser um texto' })
  titulo: string;

  @ApiProperty({
    example: 'Departamento',
    description: 'Departamento do chamado',
    required: true,
  })
  @IsString({ message: 'Departamento deve ser um texto' })
  departamento: string;

  @ApiProperty({
    example: 'Prioridade',
    description: 'Prioridade do chamado',
    required: true,
  })
  @IsString({ message: 'Prioridade deve ser um texto' })
  prioridade: string;

  @ApiProperty({
    example: 'Data e hora da queixa',
    description: 'Data e hora da queixa',
    required: true,
  })
  @IsString({ message: 'Data e hora da queixa deve ser em modo ISO' })
  dth_qru: string;

  @ApiProperty({
    example: 'Descrição',
    description: 'Descrição do chamado',
    required: true,
  })
  @IsString({ message: 'Descrição deve ser um texto' })
  descricao: string;

  @ApiProperty({
    example: 'Status',
    description: 'Status do chamado',
    required: true,
  })
  @IsString({ message: 'Status deve ser um texto' })
  status: string;

  @ApiProperty({
    example: 'ID da Solicitação',
    description: 'ID da Solicitação',
    required: true,
  })
  @IsNumber({}, { message: 'ID da Solicitação deve ser um número' })
  solicitacaoId: number;

  @ApiProperty({
    example: 'ID do Usuário',
    description: 'ID do Usuário',
    required: true,
  })
  @IsNumber({}, { message: 'ID do Usuário deve ser um número' })
  idUser: number;

  @ApiProperty({
    example: 'Imagens',
    description: 'Imagens do chamado',
    required: true,
    type: () => [ObjectImageDto], // Adicionado para clareza
  })
  @IsOptional()
  images: ObjectImageDto[];

  @ApiProperty({
    example: '{"status": "Em andamento", "descricao": "Descrição do chamado"}',
    description: 'linha do tempo',
    required: true,
    type: () => [TimelineDto], // Adicionado para clareza
  })
  @IsOptional()
  temp: TimelineDto[];
}
