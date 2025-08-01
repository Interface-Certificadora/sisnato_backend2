import { ApiProperty } from '@nestjs/swagger';

export class DiretoTagEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  diretoId: number;
  @ApiProperty()
  descricao: string;
}