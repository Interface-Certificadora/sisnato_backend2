import { HttpException, Injectable } from '@nestjs/common';
import { CreateBugDto } from './dto/create-bug.dto';
import { ErrorEntity } from 'src/entities/error.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Bug } from './entities/bug.entity';
import { plainToClass } from 'class-transformer';
import { DatabaseResilient } from '../../prisma/decorators/database-resilient.decorator';

@Injectable()
export class BugService {
  constructor(private readonly Prisma: PrismaService) {}
  async create(createBugDto: CreateBugDto) {
    try {
      const req = await this.Prisma.write.bug.create({
        data: createBugDto,
      });
      return req;
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  @DatabaseResilient({
    context: 'BugService.findAll',
    fallbackValue: [],
  })
  async findAll(): Promise<Bug[]> {
    try {
      const req = await this.Prisma.read.bug.findMany({
        where: {
          status: true,
        },
      });
      if (!req) {
        const retorno: ErrorEntity = {
          message: 'Nenhum bug encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Bug, item)) || [];
    } catch (error) {
      if (error.message?.includes('Engine is not yet connected')) {
        throw error;
      }

      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async remove(id: number) {
    try {
      await this.Prisma.write.bug.delete({
        where: {
          id,
        },
      });
      return {
        message: 'Bug removido com sucesso',
      };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }
}
