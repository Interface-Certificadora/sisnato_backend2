import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome do usuário',
    example: 'John Doe',
  })
  @IsString({ message: 'Nome deve ser uma string válida' })
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ description: 'Nome de usuário', example: 'johndoe' })
  @IsOptional()
  @IsString({ message: 'Nome de usuário deve ser uma string válida' })
  username?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '(11) 99999-9999',
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string válida' })
  @Transform(({ value }) => value?.trim())
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'johndoe@me.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: 'Empreendimento do usuário',
    example: [1, 2],
  })
  @IsOptional()
  empreendimento?: number[];

  @ApiPropertyOptional({
    description: 'Financeira do usuário',
    example: [1, 2],
  })
  @IsOptional()
  Financeira?: number[];

  @ApiPropertyOptional({ description: 'Cargo do usuário', example: 'ADM' })
  @IsOptional()
  @IsString({ message: 'Selecionar um cargo' })
  cargo?: string;

  @ApiPropertyOptional({ description: 'Hierarquia do usuário', example: 'ADM' })
  @IsOptional()
  @IsString({ message: 'Selecionar uma hierarquia' })
  hierarquia?: string;

  @ApiPropertyOptional({ description: 'Senha do usuário', example: '123456' })
  @IsString({ message: 'Senha deve ser uma string válida' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  password?: string;

  @ApiPropertyOptional({
    description: 'Status do usuário',
    example: true,
  })
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional({
    description: 'Termos do usuário',
    example: true,
  })
  @IsOptional()
  termos?: boolean;
}
