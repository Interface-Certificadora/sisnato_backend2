import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PesquisaRelatorioDto {
  @IsString()
  @ApiProperty({
    example: '12345678901234',
    description: 'CNPJ ou Razão Social ou Fantasia da Construtora',
    required: true,
  })
  pesquisa: string;
}
