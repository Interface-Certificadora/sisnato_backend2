import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PesquisaRelatorioNatosignDto {
  @IsString()
  @ApiProperty({
    example: '12345678901234',
    description:
      'CNPJ, razão social, fantasia (Construtora ou CCA) ou protocolo',
    required: true,
  })
  pesquisa: string;
}
