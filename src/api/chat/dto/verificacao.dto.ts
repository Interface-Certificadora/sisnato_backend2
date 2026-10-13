import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class ChatVerificacaoRespostaDto {
  @ApiProperty({ example: '12345678900' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  cpf: string;
}

export class ChatVincularSolicitacaoDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  solicitacaoId: number;
}
