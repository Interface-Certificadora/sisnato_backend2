import { HttpException, Injectable } from '@nestjs/common';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../log/log.service';
import { ErrorChamadoEntity } from './entities/chamado.error.entity';
import { plainToClass } from 'class-transformer';
import { Chamado } from './entities/chamado.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChamadoService {
  constructor(
    private prismaService: PrismaService,
    private Log: LogService,
  ) {}
  async create(createChamadoDto: CreateChamadoDto, user: any) {
    try {
      const { solicitacao, ...rest } = createChamadoDto;
      const req = await this.prismaService.chamado.create({
        data: {
          ...rest,
          images: rest.images as Prisma.InputJsonValue[],
          User: {
            connect: {
              id: user.id,
            },
          },
          solicitacaoData: {
            connect: {
              id: solicitacao,
            },
          },
        },
      });

      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não cadastrado',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: user.id,
        EffectId: req.id,
        Rota: 'Chamado',
        Descricao: `Chamado Cadastrado por ${user.id}-${user.nome} no sistema com o ID: ${req.id} para a Solicitacao: ${solicitacao}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Chamado, req);
      return null;
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAll() {
    try {
      const req = await this.prismaService.chamado.findMany({
        where: {
          status: { not: 2 },
        },
        orderBy: {
          status: 'asc',
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamados não encontrados',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Chamado, item));
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findOne(id: number) {
    try {
      const req = await this.prismaService.chamado.findUnique({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Chamado, req);
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async update(id: number, updateChamadoDto: UpdateChamadoDto, user: any) {
    try {
      const req = await this.prismaService.chamado.update({
        where: {
          id: id,
        },
        data: {
          ...updateChamadoDto,
          respostaData: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: user.id,
        EffectId: req.id,
        Rota: 'Chamado',
        Descricao: `Chamado Atualizado por ${user.id}-${user.nome} atulizações: ${JSON.stringify(updateChamadoDto)}, Chamado ID: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Chamado, req);
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async remove(id: number, user: any) {
    try {
      const req = await this.prismaService.chamado.update({
        where: {
          id: id,
        },
        data: {
          status: 3,
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'Chamado',
        Descricao: `Chamado Fechado por ${user.id}-${user.nome}, ID do Chamado: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Chamado, req);
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  //VERIFICAR SE ESTA SENDO UTILIZADO
  async pesquisar(query: any) {
    try {
      const whereClause = { ...query };
      if (query.idUser) {
        whereClause.idUser = +query.idUser;
      }
      const req = await this.prismaService.chamado.findMany({
        where: whereClause,
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamados não encontrados',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Chamado, item));
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async countTotal() {
    try {
      const req = await this.prismaService.chamado.count({
        where: {
          status: 0,
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamados não encontrados',
        };
        throw new HttpException(retorno, 404);
      }
      return req;
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
