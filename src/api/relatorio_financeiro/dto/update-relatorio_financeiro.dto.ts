import { PartialType } from '@nestjs/mapped-types';
import { CreateRelatorioFinanceiroDto } from './create-relatorio_financeiro.dto';

export class UpdateRelatorioFinanceiroDto extends PartialType(CreateRelatorioFinanceiroDto) {}
