import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'O token recebido por email' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'A nova senha do usuário', minLength: 6 })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;
}
