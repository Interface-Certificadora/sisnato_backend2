import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ConsultarHorariosDto {
  @IsNotEmpty({ message: 'O parâmetro data é obrigatório.' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data deve estar no formato YYYY-MM-DD.',
  })
  data: string;
}
