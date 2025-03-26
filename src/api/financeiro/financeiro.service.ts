import { Injectable } from '@nestjs/common';
import { CreateFinanceiroDto } from './dto/create-financeiro.dto';
import { UpdateFinanceiroDto } from './dto/update-financeiro.dto';

@Injectable()
export class FinanceiroService {
  create(createFinanceiroDto: CreateFinanceiroDto) {
    return 'This action adds a new financeiro';
  }

  findAll() {
    return `This action returns all financeiro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} financeiro`;
  }

  update(id: number, updateFinanceiroDto: UpdateFinanceiroDto) {
    return `This action updates a #${id} financeiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} financeiro`;
  }
}
