import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ContactDto {
  @ApiProperty({
    description: 'Nome completo do remetente.',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres.' })
  nome: string;

  @ApiProperty({
    description: 'E-mail válido do remetente para contato.',
    example: 'joao.silva@example.com',
  })
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  email: string;

  @ApiProperty({
    description: 'Nome da empresa do remetente (opcional).',
    example: 'Silva & Filhos Ltda.',
    required: false, // Indica ao Swagger que este campo não é obrigatório
  })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem a ser enviada.',
    example: 'Gostaria de saber mais sobre o plano "401-1000 Processos"...',
  })
  @IsString()
  @IsNotEmpty({ message: 'A mensagem não pode ser vazia.' })
  @MinLength(10, { message: 'A mensagem deve ter pelo menos 10 caracteres.' })
  mensagem: string;
}
