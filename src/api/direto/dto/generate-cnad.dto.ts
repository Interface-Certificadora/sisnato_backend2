import { IsNotEmpty, IsNumber } from 'class-validator';

export class GenerateCnabDto {
  @IsNumber()
  @IsNotEmpty()
  cca: number;

  @IsNumber()
  @IsNotEmpty()
  empreendimento: number;

  @IsNumber()
  @IsNotEmpty()
  corretorId: number;
}
