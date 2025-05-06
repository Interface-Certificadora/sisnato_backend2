import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class SystemMessage {
  @ApiProperty({
    description: 'ID do sistema',
    example: 1,
    type: Number,
  })
  @IsOptional()
  id: number;

  @ApiProperty({
    description: 'Tipo da mensagem',
    example: 'INFO',
    type: String,
  })
  @IsOptional()
  tipo: string;

  @ApiProperty({
    description: 'Mensagem',
    example: 'Mensagem',
    type: String,
  })
  @IsOptional()
  message: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2022-01-01T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2022-01-01T00:00:00.000Z',
    type: Date,
  })
  @IsOptional()
  updatedAt: Date;

  constructor(partial: Partial<SystemMessage>) {
    Object.assign(this, partial);
  }
}
