import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class filterSolicitacaoDto {
  @IsOptional()
  @IsNumber({}, { message: 'id deve ser um número' })
  @IsPositive({ message: 'id deve ser um número positivo' })
  id: number;

  @IsOptional()
  @IsString({ message: 'nome deve ser uma string' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'andamento deve ser uma string' })
  andamento: string;

  @IsOptional()
  @IsNumber({}, { message: 'construtora deve ser um número' })
  @IsPositive({ message: 'construtora deve ser um número positivo' })
  construtora: number;

  @IsOptional()
  @IsNumber({}, { message: 'empreendimento deve ser um número' })
  @IsPositive({ message: 'empreendimento deve ser um número positivo' })
  empreendimento: number;

  @IsOptional()
  @IsNumber({}, { message: 'financeiro deve ser um número' })
  @IsPositive({ message: 'financeiro deve ser um número positivo' })
  financeiro: number;
}
