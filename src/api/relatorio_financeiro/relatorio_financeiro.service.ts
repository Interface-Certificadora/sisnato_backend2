import { Injectable } from '@nestjs/common';
import { CreateRelatorioFinanceiroDto } from './dto/create-relatorio_financeiro.dto';
import { UpdateRelatorioFinanceiroDto } from './dto/update-relatorio_financeiro.dto';

@Injectable()
export class RelatorioFinanceiroService {
  create(createRelatorioFinanceiroDto: CreateRelatorioFinanceiroDto) {
    return 'This action adds a new relatorioFinanceiro';
  }

  findAll() {
    return `This action returns all relatorioFinanceiro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} relatorioFinanceiro`;
  }

  update(id: number, updateRelatorioFinanceiroDto: UpdateRelatorioFinanceiroDto) {
    return `This action updates a #${id} relatorioFinanceiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} relatorioFinanceiro`;
  }
}
