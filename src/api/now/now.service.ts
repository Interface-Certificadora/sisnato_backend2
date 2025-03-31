import { Injectable } from '@nestjs/common';
import { CreateNowDto } from './dto/create-now.dto';
import { UpdateNowDto } from './dto/update-now.dto';

@Injectable()
export class NowService {
  create(createNowDto: CreateNowDto) {
    return 'This action adds a new now';
  }

  findAll() {
    return `This action returns all now`;
  }

  findOne(id: number) {
    return `This action returns a #${id} now`;
  }

  update(id: number, updateNowDto: UpdateNowDto) {
    return `This action updates a #${id} now`;
  }

  remove(id: number) {
    return `This action removes a #${id} now`;
  }
}
