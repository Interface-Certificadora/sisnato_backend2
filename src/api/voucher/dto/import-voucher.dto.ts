import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class GvsVoucherItem {
  @ApiProperty({ example: '060197f9e233bc' })
  @IsString()
  gvs_voucher: string;

  @ApiProperty({ example: 'BIRD ID PF A3 - 5000', required: false })
  @IsString()
  @IsOptional()
  gvs_pro_descr_prod: string;

  // Outros campos do JSON que não usamos obrigatoriamente
  @IsString()
  @IsOptional()
  situcao: string;
}

class GvsResult {
  @ApiProperty({ type: [GvsVoucherItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GvsVoucherItem)
  result: GvsVoucherItem[];
}

export class ImportVoucherJsonDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => GvsResult)
  data: GvsResult;
}
