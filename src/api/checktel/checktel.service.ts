import { Injectable } from '@nestjs/common';
import { CreateChecktelDto } from './dto/create-checktel.dto';
import { UpdateChecktelDto } from './dto/update-checktel.dto';

@Injectable()
export class ChecktelService {
  create(createChecktelDto: CreateChecktelDto) {
    return 'This action adds a new checktel';
  }

  findAll() {
    return `This action returns all checktel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} checktel`;
  }

  update(id: number, updateChecktelDto: UpdateChecktelDto) {
    return `This action updates a #${id} checktel`;
  }

  remove(id: number) {
    return `This action removes a #${id} checktel`;
  }
}
