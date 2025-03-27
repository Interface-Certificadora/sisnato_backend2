import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class PostLogDto {
  @IsNumber({}, { message: 'O User deve ser um numero' })
  @IsNotEmpty({ message: 'O User nao pode ser null ou undefined' })
  @IsPositive({ message: 'O User deve ser um numero positivo' })
  User: number;

  @IsNumber({}, { message: 'O EffectId deve ser um numero' })
  @IsNotEmpty({ message: 'O EffectId nao pode ser null ou undefined' })
  @IsPositive({ message: 'O EffectId deve ser um numero positivo' })
  EffectId: number;

  @IsString({ message: 'A rota deve ser uma string' })
  @IsNotEmpty({ message: 'A rota nao pode ser null ou undefined' })
  rota: string;

  @IsString({ message: 'A descricao deve ser uma string' })
  @IsNotEmpty({ message: 'A descricao nao pode ser null ou undefined' })
  descricao: string;
}
