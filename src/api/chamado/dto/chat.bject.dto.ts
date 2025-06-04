import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ChatObjectDto {
  @ApiProperty({
    example: 'Autor',
    description: 'Autor da mensagem',
    required: true,
  })
  @IsString()
  autor: string;

  @ApiProperty({
    example: 'Mensagem',
    description: 'Mensagem da mensagem',
    required: true,
  })
  @IsString()
  mensagem: string;

  @ApiProperty({
    example: 'Autor ID',
    description: 'ID do autor da mensagem',
    required: true,
  })
  @IsNumber()
  autor_id: number;

  @ApiProperty({
    example: 'Data',
    description: 'Data da mensagem',
    required: true,
  })
  @IsString()
  data: string;

  @ApiProperty({
    example: 'Hora',
    description: 'Hora da mensagem',
    required: true,
  })
  @IsString()
  hora: string;

  @ApiProperty({
    example: 'ID',
    description: 'ID da mensagem',
    required: true,
  })
  @IsString()
  id: string;

  toJSON() {
    return {
      autor: this.autor,
      mensagem: this.mensagem,
      autor_id: this.autor_id,
      data: this.data,
      hora: this.hora,
      id: this.id,
    };
  }
}
