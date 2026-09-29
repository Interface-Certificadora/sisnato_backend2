import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateImobiliariaDto {
  @ApiPropertyOptional({
    description: 'CNPJ da imobiliária',
    example: '00000000000100',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Razão social da imobiliária',
    example: 'Imobiliária A',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Razão social deve ser uma string' })
  razaosocial?: string;

  @ApiPropertyOptional({
    description: 'Fantasia da imobiliária',
    example: 'Imobiliária A',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Fantasia deve ser uma string' })
  fantasia?: string;

  @ApiPropertyOptional({
    description: 'Telefone da imobiliária',
    example: '0000000000',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  tel?: string;

  @ApiPropertyOptional({
    description: 'E-mail da imobiliária',
    example: 'contato@imobiliaria.com',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'E-mail deve ser uma string' })
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: 'Observações',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  obs?: string;

  @ApiPropertyOptional({
    description: 'Status da imobiliária',
    example: 'true',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'Status deve ser um booleano' })
  status?: boolean;
}
