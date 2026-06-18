import { IsNotEmpty, IsString } from 'class-validator';

export class ConsultarClienteTelefoneDto {
  @IsNotEmpty({ message: 'O parâmetro telefone é obrigatório.' })
  @IsString()
  telefone: string;
}
