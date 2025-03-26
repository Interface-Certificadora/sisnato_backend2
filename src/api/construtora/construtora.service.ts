import { Injectable } from '@nestjs/common';
import { CreateConstrutoraDto } from './dto/create-construtora.dto';
import { UpdateConstrutoraDto } from './dto/update-construtora.dto';

@Injectable()
export class ConstrutoraService {
  create(createConstrutoraDto: CreateConstrutoraDto) {
    return 'This action adds a new construtora';
  }

  findAll() {
    return `This action returns all construtora`;
  }

  findOne(id: number) {
    return `This action returns a #${id} construtora`;
  }

  update(id: number, updateConstrutoraDto: UpdateConstrutoraDto) {
    return `This action updates a #${id} construtora`;
  }

  remove(id: number) {
    return `This action removes a #${id} construtora`;
  }
}
