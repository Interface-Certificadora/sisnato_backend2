import { Injectable } from '@nestjs/common';

import { HttpException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { TagListEntity } from './entities/tag-list.entity';
import { CreateTagsListDto } from './dto/create-tag-list.dto';

@Injectable()
export class TagListService {
  constructor(private readonly Prisma: PrismaService) {}
  private readonly logger = new Logger(TagListService.name, {
    timestamp: true,
  });

  async create(createTagListDto: CreateTagsListDto) {
    try {
      const res = await this.Prisma.write.tagList.create({
        data: {
          label: createTagListDto.label,
        },
      });
      return plainToClass(TagListEntity, res);
    } catch (error) {
      this.logger.error(
        'Erro ao criar tagList:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async findAll() {
    try {
      const req = await this.Prisma.read.tagList.findMany();
      return req.map((item: any) => plainToClass(TagListEntity, item));
    } catch (error) {
      this.logger.error(
        'Erro ao buscar tagList:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async remove(id: number) {
    try {
      await this.Prisma.write.tagList.delete({
        where: { id },
      });
      return { message: 'Tag da lista de tags, excluida com sucesso' };
    } catch (error) {
      this.logger.error(
        'Erro ao deletar tagList:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }
}
