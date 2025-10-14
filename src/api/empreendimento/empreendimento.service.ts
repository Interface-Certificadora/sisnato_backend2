import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorEmpreendimentoEntity } from './entities/empreendimento.error.entity';
import { Empreendimento } from './entities/empreendimento.entity';
import { plainToClass } from 'class-transformer';
import { LogService } from '../../log/log.service';
import { UserPayload } from 'src/auth/entities/user.entity';

@Injectable()
export class EmpreendimentoService {
  constructor(
    private prismaService: PrismaService,
    private Log: LogService,
  ) {}
  private readonly logger = new Logger(EmpreendimentoService.name, {
    timestamp: true,
  });

  async create(dados: CreateEmpreendimentoDto, User: UserPayload) {
    try {
      const { financeiro, ...rest } = dados;

      const req = await this.prismaService.write.empreendimento.create({
        data: rest,
      });
      if (!req) {
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao Criado',
        };
        throw new HttpException(retorno, 404);
      }
      if (User.hierarquia === 'GRT') {
        await this.prismaService.write.userEmpreendimento.create({
          data: {
            empreendimento: {
              connect: {
                id: req.id,
              },
            },
            user: {
              connect: {
                id: User.id,
              },
            },
          },
        });
      }

      financeiro.forEach(async (item: number) => {
        const ExistFinanceiro =
          await this.prismaService.read.financeiro.findUnique({
            where: {
              id: item,
            },
          });

        if (ExistFinanceiro) {
          await this.prismaService.write.financeiroEmpreendimento.create({
            data: {
              empreendimento: {
                connect: {
                  id: req.id,
                },
              },
              financeiro: {
                connect: {
                  id: item,
                },
              },
            },
          });
        }
      });
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Empreendimento',
        Descricao: `Empreendimento Criado por ${User.id}-${User.nome} com o Nome: ${req.nome} vinculado a Construtora: ${req.construtoraId} com as Financeiras: ${financeiro} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Empreendimento, req);
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos create:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  /**
   * @description Busca todos os empreendimentos que o usu rio tem permissão.
   * @param {UserPayload} user - Usuario que esta fazendo a consulta.
   * @returns {Promise<Empreendimento[]>} - Empreendimentos encontrados.
   */
  async findAll(user: any) {
    try {
      const financeira = user.Financeira;
      const hierarquia = user.hierarquia;
      const construtora = user.construtora;

      const EmpreList =
        await this.prismaService.read.userEmpreendimento.findMany({
          where: {
            userId: user.id,
          },
        });

      const Ids = financeira || [];
      const IdsConst = construtora || [];

      const req = await this.prismaService.read.empreendimento.findMany({
        where: {
          ...(hierarquia !== 'ADM' && {
            status: true,
          }),
          ...(hierarquia === 'CONST' && {
            OR: Ids.map((id: any) => ({
              financeira: {
                some: {
                  id: id,
                },
              },
            })),
          }),
          ...(hierarquia === 'GRT' && {
            construtora: {
              id: {
                in: IdsConst,
              },
            },
            id: {
              in: EmpreList.map((item) => item.empreendimentoId),
            },
          }),
        },
        select: {
          id: true,
          nome: true,
          estado: true,
          cidade: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          construtora: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          financeiros: {
            select: {
              financeiro: {
                select: {
                  id: true,
                  fantasia: true,
                },
              },
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      });
      if (!req) {
        this.logger.error(
          'Erro empreendimentos findAll:Empreendimentos nao encontrado',
        );
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimentos nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      console.log("🚀 ~ EmpreendimentoService ~ findAll ~ req:", JSON.stringify(req, null, 2))
      return req || [];
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos findAll:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async GetAllSearch(financeira: number, construtora: number) {
    try {
      const req = await this.prismaService.read.empreendimento.findMany({
        where: {
          construtora: {
            id: construtora,
          },
          financeiros: {
            some: {
              financeiroId: financeira,
            },
          },
        },
        select: {
          id: true,
          nome: true,
        },
      });

      if (!req) {
        this.logger.error(
          'Erro empreendimentos GetAllSearch: Empreendimentos nao encontrado',
        );
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimentos nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Empreendimento, item));
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos GetAllSearch:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findOne(id: number) {
    try {
      const req = await this.prismaService.read.empreendimento.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          nome: true,
          estado: true,
          cidade: true,
          status: true,
          construtora: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          financeiros: {
            select: {
              financeiro: {
                select: {
                  id: true,
                  fantasia: true,
                },
              },
            },
          },
        },
      });
      if (!req) {
        this.logger.error(
          'Erro empreendimentos findOne: Empreendimento nao encontrado',
        );
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Empreendimento, req);
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos findOne:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async update(
    id: number,
    updateEmpreendimentoDto: UpdateEmpreendimentoDto,
    User: any,
  ) {
    try {
      const { financeiro, construtoraId, ...rest } = updateEmpreendimentoDto;
      const req = await this.prismaService.write.empreendimento.update({
        where: {
          id: id,
        },
        data: {
          ...rest,
          ...(construtoraId && {
            construtora: {
              connect: {
                id: construtoraId,
              },
            },
          }),
        },
      });
      if (!req) {
        this.logger.error(
          'Erro empreendimentos update:Empreendimento nao encontrado',
        );
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      const teste =
        await this.prismaService.write.financeiroEmpreendimento.deleteMany({
          where: {
            empreendimentoId: id,
          },
        });
      financeiro.forEach(async (item: number) => {
        const ExistFinanceiro =
          await this.prismaService.read.financeiro.findUnique({
            where: {
              id: item,
            },
          });
        if (ExistFinanceiro) {
          await this.prismaService.write.financeiroEmpreendimento.create({
            data: {
              financeiro: {
                connect: {
                  id: item,
                },
              },
              empreendimento: {
                connect: {
                  id: id,
                },
              },
            },
          });
        }
      });
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Empreendimento',
        Descricao: `Empreendimento Atualizado por ${User.id}-${User.nome} atualizações: ${JSON.stringify(updateEmpreendimentoDto)}, Empreendimento ID: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Empreendimento, req);
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos update:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async remove(id: number, User: any) {
    try {
      const isAtivo = await this.prismaService.read.empreendimento.findUnique({
        where: {
          id: id,
        },
        select: {
          status: true,
        },
      });
      if (!isAtivo) {
        this.logger.error(
          'Erro empreendimentos remove:Empreendimento nao encontrado',
        );
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      const req = await this.prismaService.write.empreendimento.update({
        where: {
          id: id,
        },
        data: {
          status: isAtivo.status ? false : true,
        },
      });
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Empreendimento',
        Descricao: `Empreendimento Deletado por ${User.id}-${User.nome} Nome Empreendimento: ${req.nome} ID Empreendimento: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Empreendimento, req);
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos remove:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async GetByConstrutora(id: number) {
    try {
      const req = await this.prismaService.read.empreendimento.findMany({
        where: {
          construtora: {
            id: id,
          },
        },
        select: {
          id: true,
          nome: true,
        },
      });
      if (!req) {
        this.logger.error(
          'Erro empreendimentos GetByConstrutora:Empreendimentos nao encontrado',
        );
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimentos nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Empreendimento, item));
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos GetByConstrutora:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async GetByConfereList(data: any) {
    const { id, empreendimento, construtora, Financeira } = data;
    try {
      const listConst = await this.prismaService.read.financeiro.findMany({
        where: {
          id: {
            in: Financeira,
          },
        },
        select: {
          id: true,
        },
      });
      listConst.forEach(async (item) => {
        const existUser = await this.prismaService.read.user.findUnique({
          where: {
            id: +id,
          },
        });
        if (!existUser) {
          this.logger.error(
            'Erro empreendimentos GetByConfereList:Usuario nao encontrado id: ' +
              id,
          );
          throw new HttpException('Usuario nao encontrado', 404);
        }
        await this.prismaService.write.userFinanceiro.create({
          data: {
            financeiroId: item.id,
            userId: +id,
          },
        });
      });

      return 'ok';
    } catch (error) {
      this.logger.error(
        'Erro empreendimentos GetByConfereList:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }
}
