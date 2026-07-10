// dto/create-fcweb-agente.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFcwebAgenteDto {
  @IsNotEmpty()
  @IsNumber()
  solicitacaoId: number;

  @IsNotEmpty()
  @IsNumber()
  agenteId: number;

  @IsNotEmpty()
  @IsString()
  agenteNome: string;

  @IsNotEmpty()
  @IsString()
  dataAgendamento: string; // Formato: "yyyy-MM-dd"

  @IsNotEmpty()
  @IsString()
  horaAgendamento: string; // Formato: "HH:mm"

  @IsNotEmpty()
  @IsString()
  dt_nascimento: string; // Formato: "yyyy-MM-dd"

  @IsNotEmpty()
  @IsString()
  emailInformado: string;

  @IsOptional()
  @IsString()
  registro_cnh?: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  telefone?: string;
}
