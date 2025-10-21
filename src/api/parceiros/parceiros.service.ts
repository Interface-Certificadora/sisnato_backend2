import { Injectable } from '@nestjs/common';
import { CreateParceiroDto } from './dto/create-parceiro.dto';
import { UpdateParceiroDto } from './dto/update-parceiro.dto';

@Injectable()
export class ParceirosService {
  create(createParceiroDto: CreateParceiroDto) {
    return 'This action adds a new parceiro';
  }

  findAll() {
    return `This action returns all parceiros`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parceiro`;
  }

  update(id: number, updateParceiroDto: UpdateParceiroDto) {
    return `This action updates a #${id} parceiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} parceiro`;
  }
}
