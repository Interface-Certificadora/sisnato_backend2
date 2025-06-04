import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class GetLogsDto {
  @IsNumber({}, { message: 'O Id deve ser um numero' })
  @IsNotEmpty({ message: 'O Id não pode ser null ou undefined' })
  @IsPositive({ message: 'O Id deve ser um numero positivo' })
  Id: number;

  @IsString({ message: 'A rota deve ser uma string' })
  @IsNotEmpty({ message: 'A rota nao pode ser null ou undefined' })
  Rota: string;
}
