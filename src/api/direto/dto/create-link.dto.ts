import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";


export class CreateLinkDto {
  @ApiProperty({
    description: 'id do cca',
  })
  @IsNumber({}, { message: 'cca deve ser um numero' })
  financeiroId: number;

  @ApiProperty({
    description: 'id do empreendimento',
  })
  @IsNumber({}, { message: 'empreendimento deve ser um numero' })
  empreendimentoId: number;

  @ApiProperty({
    description: 'baseUrl para gerar link',
  })
  @IsString({ message: 'baseUrl deve ser uma string' })
  baseUrl: string;
}
