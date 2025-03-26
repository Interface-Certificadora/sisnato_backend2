import { Injectable } from '@nestjs/common';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';

@Injectable()
export class EmpreendimentoService {
  create(createEmpreendimentoDto: CreateEmpreendimentoDto) {
    return 'This action adds a new empreendimento';
  }

  findAll() {
    return `This action returns all empreendimento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} empreendimento`;
  }

  update(id: number, updateEmpreendimentoDto: UpdateEmpreendimentoDto) {
    return `This action updates a #${id} empreendimento`;
  }

  remove(id: number) {
    return `This action removes a #${id} empreendimento`;
  }
}
