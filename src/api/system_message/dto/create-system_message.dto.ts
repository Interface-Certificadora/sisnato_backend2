import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSystemMessageDto {
  @ApiProperty({
    example: 'info',
    description: 'Tipo da mensagem',
    required: true,
    enum: ['INFO', 'ERROR', 'WARNING'],
  })
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsEnum(['INFO', 'ERROR', 'WARNING'], { message: 'Tipo deve ser INFO, ERROR ou WARNING' })
  @IsNotEmpty({ message: 'Tipo deve ser informado' })
  tipo: string;

  @ApiProperty({
    example: 'Mensagem',
    description: 'Mensagem',
    required: true,
  })
  @IsString({ message: 'Mensagem deve ser uma string' })
  @MinLength(1, { message: 'Mensagem deve ter pelo menos 1 caractere' })
  @MaxLength(255, { message: 'Mensagem deve ter no máximo 255 caracteres' })
  @IsNotEmpty({ message: 'Mensagem deve ser informada' })
  message: string;
}
