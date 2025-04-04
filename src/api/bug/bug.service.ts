import { HttpException, Injectable } from '@nestjs/common';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { ErrorEntity } from 'src/entities/error.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Bug } from './entities/bug.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BugService {
  constructor(private readonly Prisma: PrismaService) {}
  create(createBugDto: CreateBugDto) {
    return 'This action adds a new bug';
  }

  
  /**
   * Find all bugs.
   *
   * Returns a list of all bugs that are active (status = true).
   *
   * @throws {HttpException} 404 - If no bugs are found.
   * @throws {HttpException} 400 - If there is any other error.
   *
   * @returns {Promise<Bug[]>} - A list of bugs.
   */
  async findAll(): Promise<Bug[]> {
    try {
      const req = await this.Prisma.bug.findMany({
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
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
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
