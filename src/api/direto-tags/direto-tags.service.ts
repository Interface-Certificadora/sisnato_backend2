import { Injectable } from '@nestjs/common';
import { CreateDiretoTagDto } from './dto/create-direto-tag.dto';
import { UpdateDiretoTagDto } from './dto/update-direto-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiretoTagsService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createDiretoTagDto: CreateDiretoTagDto) {
    return await this.prisma.diretoTag.create({
      data: createDiretoTagDto,
    });
  }

  async findAll() {
    return await this.prisma.diretoTag.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.diretoTag.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateDiretoTagDto: UpdateDiretoTagDto) {
    return await this.prisma.diretoTag.update({
      where: { id },
      data: updateDiretoTagDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.diretoTag.delete({ where: { id } });
  }
}