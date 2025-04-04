import { HttpException, Injectable } from '@nestjs/common';
import { CreateSuporteDto } from './dto/create-suporte.dto';
import { UpdateSuporteDto } from './dto/update-suporte.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Suporte } from './entities/suporte.entity';
import { ErrorSuporteEntity } from './entities/suporte.error.entity';
import { plainToClass } from 'class-transformer';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class SuporteService {
  constructor(
    private prismaService: PrismaService,
    private S3: S3Service,
  ) {}
  async create(createSuporteDto: CreateSuporteDto): Promise<Suporte> {
    try {
      const req = await this.prismaService.suporte.create({
        data: createSuporteDto,
      });
      if (!req) {
        const retorno: ErrorSuporteEntity = {
          message: 'Suporte nao cadastrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Suporte, req);
    } catch (error) {
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAll(id: number): Promise<Suporte[]> {
    try {
      const req = await this.prismaService.suporte.findMany({
        where: {
          solicitacao: id,
        },
      });
      if (!req) {
        const retorno: ErrorSuporteEntity = {
          message: 'Suporte nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Suporte, item));
    } catch (error) {
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findOne(id: number): Promise<Suporte> {
    try {
      const req = await this.prismaService.suporte.findUnique({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorSuporteEntity = {
          message: 'Suporte nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Suporte, req);
    } catch (error) {
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async update(id: number, updateSuporteDto: UpdateSuporteDto) {
    try {
      const { filenames, ...rest } = updateSuporteDto;
      const req = await this.prismaService.suporte.update({
        where: {
          id: id,
        },
        data: rest,
      });
      if (!req) {
        const retorno: ErrorSuporteEntity = {
          message: 'Suporte nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Suporte, req);
    } catch (error) {
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async remove(id: number) {
    try {
      const Exist = await this.prismaService.suporte.findUnique({
        where: {
          id: id,
        },
      });
      if (!Exist) {
        const retorno: ErrorSuporteEntity = {
          message: 'Suporte nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      const urls = Exist.urlveiw as any[];
      urls.map(async (url) => {
        await this.S3.deleteFile('suporte', url.url_view.split('/').pop());
      });
      const req = await this.prismaService.suporte.delete({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorSuporteEntity = {
          message: 'Suporte nao encontrado',
        };
      }
      return plainToClass(Suporte, req);
    } catch (error) {
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
