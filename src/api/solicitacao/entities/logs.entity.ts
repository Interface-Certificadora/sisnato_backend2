import { ApiProperty } from '@nestjs/swagger';

export class Logs {
  @ApiProperty()
  id: number;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  User: number;

  constructor(partial: Partial<Logs>) {
    Object.assign(this, partial);
  }
}
