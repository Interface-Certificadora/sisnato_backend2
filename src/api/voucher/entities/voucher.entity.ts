import { ApiProperty } from '@nestjs/swagger';
import { VoucherStatus } from '@prisma/client';

export class VoucherEntity {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: '060197f9e233bc' })
  codigo: string;

  @ApiProperty({ example: '10' })
  produtoSoluti: string;

  @ApiProperty({ enum: VoucherStatus, example: 'DISPONIVEL' })
  status: VoucherStatus;

  @ApiProperty({ required: false, nullable: true })
  clienteNome: string;

  @ApiProperty({ required: false, nullable: true })
  clienteCpf: string;

  @ApiProperty({ required: false, nullable: true })
  dataVinculo: Date;

  @ApiProperty({ required: false, nullable: true })
  dataUso: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
