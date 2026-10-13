import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatAcessoDto {
  @ApiProperty({ example: '+5516988081836', description: 'Telefone da URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefone: string;
}

export class ChatAcessoCpfDto extends ChatAcessoDto {
  @ApiProperty({ example: '12345678900' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  cpf: string;
}
