import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Username', example: 'admin' })
  @IsString({ message: 'Username deve ser uma string válida' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  username: string;

  @ApiProperty({ description: 'Password', example: 'admin' })
  @IsString({ message: 'Password deve ser uma string válida' })
  @IsNotEmpty({ message: 'Password é obrigatório' })
  password: string;

  @ApiProperty({ description: 'IP do usuário', example: '127.0.0.1' })
  @IsOptional()
  ip?: string;
}
