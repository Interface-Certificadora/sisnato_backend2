import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class RelatorioFinanceiroConstrutora {
  @ApiProperty({
    description: 'ID da Construtora',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Fantasia da Construtora',
    example: 'Construtora Teste',
  })
  @IsString()
  @IsOptional()
  fantasia: string;

  @ApiProperty({
    description: 'Razão Social da Construtora',
    example: 'Construtora Teste',
  })
  @IsString()
  @IsOptional()
  razaosocial: string;

  @ApiProperty({
    description: 'Cnpj da Construtora',
    example: '12345678900',
  })
  @IsString()
  @IsOptional()
  cnpj: string;

  constructor(partial: Partial<RelatorioFinanceiroConstrutora>) {
    Object.assign(this, partial);
  }
}
