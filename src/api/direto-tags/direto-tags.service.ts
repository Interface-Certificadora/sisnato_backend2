import { Injectable } from '@nestjs/common';
import { CreateDiretoTagDto } from './dto/create-direto-tag.dto';
import { UpdateDiretoTagDto } from './dto/update-direto-tag.dto';

@Injectable()
export class DiretoTagsService {
  create(createDiretoTagDto: CreateDiretoTagDto) {
    return 'This action adds a new diretoTag';
  }

  findAll() {
    return `This action returns all diretoTags`;
  }

  findOne(id: number) {
    return `This action returns a #${id} diretoTag`;
  }

  update(id: number, updateDiretoTagDto: UpdateDiretoTagDto) {
    return `This action updates a #${id} diretoTag`;
  }

  remove(id: number) {
    return `This action removes a #${id} diretoTag`;
  }
}
