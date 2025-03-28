import { Injectable } from '@nestjs/common';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';

@Injectable()
export class BugService {
  create(createBugDto: CreateBugDto) {
    return 'This action adds a new bug';
  }

  findAll() {
    return `This action returns all bug`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bug`;
  }

  update(id: number, updateBugDto: UpdateBugDto) {
    return `This action updates a #${id} bug`;
  }

  remove(id: number) {
    return `This action removes a #${id} bug`;
  }
}
