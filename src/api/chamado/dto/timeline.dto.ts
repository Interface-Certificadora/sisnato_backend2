import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TimelineDto {
  @ApiProperty({
    example: '686521159684616354',
    description: 'ID do chamado',
    required: true,
  })
  @IsString({ message: 'ID do chamado deve ser uma string' })
  @IsNotEmpty({ message: 'ID do chamado deve ser informado' })
  id: string;

  @ApiProperty({
    example: 'Descrição do chamado',
    description: 'Descrição do chamado',
    required: true,
  })
  @IsString({ message: 'Descrição do chamado deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição do chamado deve ser informada' })
  descricao: string;

  @ApiProperty({
    example: '2025-05-30T14:36:39.000Z',
    description: 'Data de criação',
    required: true,
  })
  @IsString({ message: 'Data de criação deve ser uma string' })
  @IsNotEmpty({ message: 'Data de criação deve ser informada' })
  createdAt: Date;

  toJSON() {
    return {
      id: this.id,
      descricao: this.descricao,
      createdAt: this.createdAt,
    };
  }
}
