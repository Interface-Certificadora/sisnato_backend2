import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateAlertDto {
  @ApiProperty({
    type: String,
    required: true,
    description: "Título da alerta",
    example: "Título da alerta",
  })
  @IsString({ message: "Título deve ser uma string válida" })
  @IsNotEmpty({ message: "Título não pode ser vazio" })
  titulo: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Descrição da alerta",
    example: "Descrição da alerta",
  })
  @IsString({ message: "Descrição deve ser uma string válida" })
  @IsNotEmpty({ message: "Descrição não pode ser vazia" })
  descricao: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: "ID da solicitação",
    example: 1,
  })
  @IsNumber({}, { message: "ID da solicitação deve ser um número válido" })
  @IsPositive({ message: "ID da solicitação deve ser um número válido" })
  @IsNotEmpty({ message: "ID da solicitação não pode ser vazio" })
  solicitacao_id: number;

  @ApiProperty({
    type: Number,
    required: true,
    description: "ID do corretor",
    example: 1,
  })
  @IsNumber({}, { message: "ID do corretor deve ser um número válido" })
  @IsPositive({ message: "ID do corretor deve ser um número válido" })
  @IsNotEmpty({ message: "ID do corretor não pode ser vazio" })
  corretor: number;

  @ApiProperty({
    type: String,
    required: true,
    description: "Tag da alerta podendo ser warning, info ou error",
    example: "tag",
  })
  @IsString({ message: "Tag deve ser uma string válida" })
  @IsNotEmpty({ message: "Tag não pode ser vazia" })
  tag: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: "ID do empreendimento",
    example: 1,
  })
  @IsNumber({}, { message: "ID do empreendimento deve ser um número válido" })
  @IsPositive({ message: "ID do empreendimento deve ser um número válido" })
  @IsNotEmpty({ message: "ID do empreendimento não pode ser vazio" })
  empreendimento: number;

  @ApiProperty({
    type: Boolean,
    required: false,
    description: "Status da alerta",
    example: true,
  })
   @IsBoolean({ message: 'Status deve ser "true" ou "false"' })
  @IsOptional()
  status: boolean;
}
