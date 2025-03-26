import { Injectable } from '@nestjs/common';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';

@Injectable()
export class ChamadoService {
  create(createChamadoDto: CreateChamadoDto) {
    return 'This action adds a new chamado';
  }

  findAll() {
    return `This action returns all chamado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chamado`;
  }

  update(id: number, updateChamadoDto: UpdateChamadoDto) {
    return `This action updates a #${id} chamado`;
  }

  remove(id: number) {
    return `This action removes a #${id} chamado`;
  }
}
