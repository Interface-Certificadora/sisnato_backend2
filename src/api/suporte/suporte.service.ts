import { Injectable } from '@nestjs/common';
import { CreateSuporteDto } from './dto/create-suporte.dto';
import { UpdateSuporteDto } from './dto/update-suporte.dto';

@Injectable()
export class SuporteService {
  create(createSuporteDto: CreateSuporteDto) {
    return 'This action adds a new suporte';
  }

  findAll() {
    return `This action returns all suporte`;
  }

  findOne(id: number) {
    return `This action returns a #${id} suporte`;
  }

  update(id: number, updateSuporteDto: UpdateSuporteDto) {
    return `This action updates a #${id} suporte`;
  }

  remove(id: number) {
    return `This action removes a #${id} suporte`;
  }
}
