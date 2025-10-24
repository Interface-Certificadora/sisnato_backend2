import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateFinanceiroDto } from './dto/create-financeiro.dto';
import { UpdateFinanceiroDto } from './dto/update-financeiro.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorFinanceiroEntity } from './entities/financeiro.error.entity';
import { Financeiro } from './entities/financeiro.entity';
import { plainToClass } from 'class-transformer';
import { LogService } from 'src/log/log.service';
import { UserPayload } from 'src/auth/entities/user.entity';

@Injectable()
export class FinanceiroService {
  constructor(
    private readonly prismaService: PrismaService,
    private Log: LogService,
  ) {}
  private readonly logger = new Logger(FinanceiroService.name, {
    timestamp: true,
  });

  private createResponse(
    message: string,
    status: number,
    data: any,
    total?: number,
    page?: number,
  ) {
    return {
      error: false,
      message,
      status,
      data,
      total: total || 0,
      page: page || 0,
    };
  }

  async create(
    createFinanceiroDto: CreateFinanceiroDto,
    User: any,
  ): Promise<Financeiro> {
    const { construtoras, ...rest } = createFinanceiroDto;
    try {
      const financeiroExists = await this.prismaService.financeiro.findUnique({
        where: { cnpj: rest.cnpj },
      });

      if (financeiroExists) {
        this.logger.warn('Financeiro ja existe');
        throw new ConflictException('Já existe um financeiro com este CNPJ.');
      }

      const req = await this.prismaService.financeiro.create({
        data: {
          ...rest,
        },
      });
      if (!req) {
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        };
        this.logger.error('Erro ao criar financeiro');
        throw new HttpException(retorno, 500);
      }
      construtoras.forEach(async (item: number) => {
        const ExistConstrutora =
          await this.prismaService.construtora.findUnique({
            where: {
              id: item,
            },
          });
        if (ExistConstrutora) {
          await this.prismaService.financeiroConstrutora.create({
            data: {
              financeiro: {
                connect: {
                  id: req.id,
                },
              },
              construtora: {
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
        Rota: 'Financeiro',
        Descricao: `Financeiro Criado por ${User.id}-${User.nome} Razão Social: ${req.razaosocial} com o CNPJ: ${req.cnpj} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Financeiro, req);
    } catch (error) {
      this.logger.error(
        'Erro financeiro create:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findAll(AdminUser: UserPayload): Promise<Financeiro[]> {
    try {
      const req = await this.prismaService.financeiro.findMany({
        where: {
          ...(AdminUser.hierarquia !== 'ADM' && {
            id: { in: AdminUser.Financeira },
            status: true,
          }),
        },
        orderBy: {
          fantasia: 'asc',
        },
        select: {
          id: true,
          cnpj: true,
          razaosocial: true,
          fantasia: true,
          tel: true,
          createdAt: true,
          updatedAt: true,
          direto: true,
          Intelesign_status: true,
          status: true,
        },
      });
      if (!req) {
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        };
        throw new HttpException(retorno, 500);
      }
      return req.map((item) => plainToClass(Financeiro, item));
    } catch (error) {
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findOne(id: number) {
    try {
      const req = await this.prismaService.financeiro.findUnique({
        where: {
          id: id,
        },
        include: {
          construtoras: {
            select: {
              construtora: {
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
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        };
        throw new HttpException(retorno, 500);
      }

      const data = {
        ...req,
        construtoras: req.construtoras.map((item) => item.construtora),
      };
      return data;
    } catch (error) {
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async update(
    id: number,
    updateFinanceiroDto: UpdateFinanceiroDto,
    User: any,
  ) {
    try {
      const { construtoras, ...rest } = updateFinanceiroDto;
      const req = await this.prismaService.financeiro.update({
        where: {
          id: id,
        },
        data: {
          ...rest,
        },
      });
      if (!req) {
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        };
        throw new HttpException(retorno, 500);
      }
      // Apenas processa construtoras se forem fornecidas
      if (
        construtoras &&
        Array.isArray(construtoras) &&
        construtoras.length > 0
      ) {
        await this.prismaService.financeiroConstrutora.deleteMany({
          where: {
            financeiroId: id,
          },
        });

        for (const item of construtoras) {
          const ExistConstrutora =
            await this.prismaService.construtora.findUnique({
              where: {
                id: item,
              },
            });
          if (ExistConstrutora) {
            await this.prismaService.financeiroConstrutora.create({
              data: {
                financeiro: {
                  connect: {
                    id: req.id,
                  },
                },
                construtora: {
                  connect: {
                    id: item,
                  },
                },
              },
            });
          }
        }
      }
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Financeiro',
        Descricao: `Financeiro Atualizado por ${User.id}-${User.nome} atualizações: ${JSON.stringify(updateFinanceiroDto)}, Financeiro ID: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Financeiro, req);
    } catch (error) {
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async remove(id: number, User: any) {
    try {
      await this.prismaService.financeiroConstrutora.deleteMany({
        where: {
          financeiroId: id,
        },
      });
      await this.prismaService.financeiroEmpreendimento.deleteMany({
        where: {
          financeiroId: id,
        },
      });
      const req = await this.prismaService.financeiro.delete({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        };
        throw new HttpException(retorno, 500);
      }
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Financeiro',
        Descricao: `Financeiro Deletado por ${User.id}-${User.nome} Razão Social: ${req.razaosocial} com o CNPJ: ${req.cnpj} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Financeiro, req);
    } catch (error) {
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findAllIntellisign(User: any) {
    try {
      const where: any = {};
      if (User.hierarquia !== 'ADM') {
        where.id = { in: User.Financeira };
      }
      where.Intelesign_status = true;
      const req = await this.prismaService.financeiro.findMany({
        where,
        select: {
          id: true,
          fantasia: true,
          Intelesign_price: true,
          Intelesign_status: true,
        },
      });
      if (!req) {
        return this.createResponse('Nenhuma financeira encontrada', 200, []);
      }
      return this.createResponse('Dados buscados com sucesso', 200, req);
    } catch (error) {
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }
}
