import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Uma mensagem de resultado da operação.',
    example: 'Alerta desabilitado com sucesso.',
  })
  message: string;
}
