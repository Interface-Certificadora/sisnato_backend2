import { IsDate, IsNumber, IsString } from "class-validator"

export class LogsEntity {
  @IsNumber()
  id: number

  @IsNumber()
  User: number

  @IsNumber()
  EffectId: number

  @IsString()
  rota: string

  @IsString()
  descricao: string

  @IsDate()
  createAt: Date

  @IsDate()
  updatedAt: Date
}