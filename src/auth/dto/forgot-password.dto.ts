import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email ou Nome de Usuário para recuperação',
    example: 'usuario123 ou usuario@email.com',
  })
  @IsNotEmpty({ message: 'O login (email ou usuário) é obrigatório.' })
  @IsString()
  login: string;
}
