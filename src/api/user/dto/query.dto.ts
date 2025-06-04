import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class QueryUserDto {
  @ApiPropertyOptional({
    description: 'Busca pelo empreendimento',
    example: '1',
  })
  @IsString({ message: 'empreendimento deve ser uma string válida' })
  @IsOptional()
  empreendimento?: string;

  @ApiPropertyOptional({
    description: 'Busca pela financeira',
    example: '1',
  })
  @IsOptional()
  @IsString({ message: 'financeira deve ser uma string válida' })
  financeiro?: string;

  @ApiPropertyOptional({
    description: 'Busca pela construtora',
    example: '1',
  })
  @IsOptional()
  @IsString({ message: 'construtora deve ser uma string válida' })
  construtora?: string;

  @ApiPropertyOptional({
    description: 'Busca pelo telefone',
    example: '11999999999',
  })
  @IsOptional()
  @IsString({ message: 'telefone deve ser uma string válida' })
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Busca pelo email',
    example: 'johndoe@me.com',
  })
  @IsOptional()
  @IsString({ message: 'email deve ser uma string válida' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Busca pelo CPF',
    example: '12345678900',
  })
  @IsOptional()
  @IsString({ message: 'cpf deve ser uma string válida' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'lista de permissões especiais',
    example: {
      adm: true,
      now: false,
      user: true,
      alert: false,
      direto: false,
      chamado: false,
      financeiro: false,
      relatorio: false,
      construtora: false,
      lista_const: false,
      lista_empre: false,
      solicitacao: false,
      lista_finace: false,
      empreendimento: true,
    },
  })
  @IsOptional()
  @IsObject({ message: 'Role deve ser um objeto' })
  role?: object;
}
