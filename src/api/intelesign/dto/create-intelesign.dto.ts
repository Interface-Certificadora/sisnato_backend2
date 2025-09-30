import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { SignatarioDto } from './sign.dto';

export class CreateIntelesignDto {
  @ApiProperty({
    description: 'Array de IDs dos signatários',
    example: '[]',
    required: false,
    type:[SignatarioDto],
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  signatarios?: SignatarioDto[];

  @ApiProperty({
    description: 'Valor do documento',
    example: 100.0,
    required: true,
    default: 15.0,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    {},
    {
      message: 'Valor deve ser um número',
    },
  )
  valor: number;

  @ApiProperty({
    description: 'ID do CCA',
    example: '1',
    required: false,
    type: () => Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    {},
    {
      message: 'CCA_ID deve ser um número',
    },
  )
  cca_id?: number;
}
