import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Username deve ser uma string válida' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  username: string;

  @IsString({ message: 'Password deve ser uma string válida' })
  @IsNotEmpty({ message: 'Password é obrigatório' })
  password: string;
}
