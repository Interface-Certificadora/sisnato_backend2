import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateSuporteDto } from './dto/create-suporte.dto';
import { UpdateSuporteDto } from './dto/update-suporte.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Suporte } from './entities/suporte.entity';
import { ErrorSuporteEntity } from './entities/suporte.error.entity';
import { plainToClass } from 'class-transformer';
import { S3Service } from 'src/s3/s3.service';
import { LogService } from 'src/log/log.service';

@Injectable()
export class SuporteService {
  constructor(
    private prismaService: PrismaService,
    private S3: S3Service,
    private Log: LogService,
  ) {}
  private readonly logger = new Logger(SuporteService.name, {
    timestamp: true,
  });

  async create(
    createSuporteDto: CreateSuporteDto,
    User: any,
  ): Promise<Suporte> {
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
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Suporte',
        Descricao: `Suporte Criado por ${User.id}-${User.nome} Tag do Suporte: ${req.tag} ID Suporte: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Suporte, req);
    } catch (error) {
      this.logger.error(
        'Erro ao criar suporte:',
        JSON.stringify(error, null, 2),
      );
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
      this.logger.error(
        'Erro ao buscar suporte:',
        JSON.stringify(error, null, 2),
      );
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
      this.logger.error(
        'Erro ao buscar suporte:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async update(id: number, updateSuporteDto: UpdateSuporteDto, User: any) {
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
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Suporte',
        Descricao: `Suporte Atualizado por ${User.id}-${User.nome}, atualizações: ${JSON.stringify(updateSuporteDto)}, ID do Suporte: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Suporte, req);
    } catch (error) {
      this.logger.error(
        'Erro ao atualizar suporte:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async remove(id: number, User: any) {
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
      await this.Log.Post({
        User: req.solicitacao,
        EffectId: req.id,
        Rota: 'Suporte',
        Descricao: `Suporte Deletado por ${req.solicitacao}-${req.solicitacao}, ID do Suporte: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Suporte, req);
    } catch (error) {
      this.logger.error(
        'Erro ao deletar suporte:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorSuporteEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
