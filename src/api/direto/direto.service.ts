import { Injectable } from '@nestjs/common';
import { CreateDiretoDto } from './dto/create-direto.dto';
import { UpdateDiretoDto } from './dto/update-direto.dto';

@Injectable()
export class DiretoService {
  create(createDiretoDto: CreateDiretoDto) {
    return 'This action adds a new direto';
  }

  findAll() {
    return `This action returns all direto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} direto`;
  }

  update(id: number, updateDiretoDto: UpdateDiretoDto) {
    return `This action updates a #${id} direto`;
  }

  remove(id: number) {
    return `This action removes a #${id} direto`;
  }
}
