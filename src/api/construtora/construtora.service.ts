import { HttpException, Injectable } from '@nestjs/common';
import { CreateConstrutoraDto } from './dto/create-construtora.dto';
import { UpdateConstrutoraDto } from './dto/update-construtora.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorConstrutoraEntity } from './entities/construtora.error.entity';
import { plainToClass } from 'class-transformer';
import { Construtora } from './entities/construtora.entity';

@Injectable()
export class ConstrutoraService {
  constructor(private prismaService: PrismaService) {}
  async create(createConstrutoraDto: CreateConstrutoraDto) {
    try {
      const Exist = this.prismaService.construtora.findUnique({
        where: {
          cnpj: createConstrutoraDto.cnpj,
        },
      });
      if (Exist) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'CNPJ já cadastrado',
        };
        throw new HttpException(retorno, 400);
      }
      
      const req = await this.prismaService.construtora.create({
        data: {
          ...createConstrutoraDto,
        },
      });
      return plainToClass(Construtora, req);
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAll() {
    try {
      const req = await this.prismaService.construtora.findMany({
        where: {
          id: {
            not: 1,
          },
        },
      });
      if (!req) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'Nenhuma construtora encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Construtora, item));
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      const req = await this.prismaService.construtora.findUnique({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'Construtora não encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Construtora, req);
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async update(id: number, updateConstrutoraDto: UpdateConstrutoraDto) {
    try {
      const req = await this.prismaService.construtora.update({
        where: {
          id: id,
        },
        data: {
          ...updateConstrutoraDto,
        },
      });
      if (!req) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'Construtora não encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Construtora, req);
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      const req = await this.prismaService.construtora.delete({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'Construtora não encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Construtora, req);
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
