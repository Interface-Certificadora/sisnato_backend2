import { Injectable } from '@nestjs/common';
import { CreateGetInfoDto } from './dto/create-get-info.dto';
import { UpdateGetInfoDto } from './dto/update-get-info.dto';

@Injectable()
export class GetInfosService {
  create(createGetInfoDto: CreateGetInfoDto) {
    return 'This action adds a new getInfo';
  }

  findAll() {
    return `This action returns all getInfos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} getInfo`;
  }

  update(id: number, updateGetInfoDto: UpdateGetInfoDto) {
    return `This action updates a #${id} getInfo`;
  }

  remove(id: number) {
    return `This action removes a #${id} getInfo`;
  }
}
