import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';
import { GetInfoTermos } from './entities/get-info.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GetInfoSolicitacaoEntity } from './entities/get-info-solicitacao-entity';
import { GetCorretorDto } from './dto/getCorretor.dto';

@Injectable()
export class GetInfosService {
  constructor(private prismaService: PrismaService) {}
  async checkCpf(cpf: string, user: any) {
    try {
      if (user.hierarquia === 'ADM') {
        const Exist = await this.prismaService.read.solicitacao.findMany({
          where: {
            cpf: cpf,
          },
        });
        if (Exist && Exist.length > 0) {
          return plainToInstance(GetInfoSolicitacaoEntity, Exist, {});
        }

        return [];
      }
      const Exist = await this.prismaService.read.solicitacao.findMany({
        where: {
          cpf: cpf,
          OR: [
            {
              andamento: {
                notIn: ['APROVADO', 'EMITIDO', 'REVOGADO'],
              },
            },
            {
              ativo: true,
            },
          ],
          construtoraId: {
            in: user.construtora,
          },
        },
      });

      if (Exist && Exist.length > 0) {
        return plainToInstance(GetInfoSolicitacaoEntity, Exist, {
          excludeExtraneousValues: true,
        });
      }

      return [];
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }

  async getTermos() {
    try {
      const req = await this.prismaService.read.termo.findFirst();
      return req.termo;
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }
  async getPoliticas(): Promise<GetInfoTermos> {
    try {
      const req = await this.prismaService.read.termo.findFirst({
        where: {
          id: 1,
        },
      });
      return plainToClass(GetInfoTermos, req);
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }

  async getOptionsAdmin() {
    try {
      const req = await this.prismaService.read.construtora.findMany({
        select: {
          id: true,
          fantasia: true,
          empreendimentos: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });
      return req.map((construtora) => {
        return {
          id: construtora.id,
          fantasia: construtora.fantasia,
          empreendimentos: construtora.empreendimentos,
        };
      });
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }

  async getOptionsUser(user: any) {
    try {
      const req = await this.prismaService.read.construtora.findMany({
        where: {
          id: {
            in: user.construtora,
          },
        },
        select: {
          id: true,
          fantasia: true,
          empreendimentos: {
            where: {
              id: {
                in: user.empreendimento,
              },
            },
            select: {
              id: true,
              nome: true,
            },
          },
          financeiros: {
            where: {
              financeiro: {
                id: {
                  in: user.Financeira,
                },
              },
            },
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
      const data = req.map((item) => ({
        id: item.id,
        fantasia: item.fantasia,
        empreendimentos: item.empreendimentos,
        financeiros: item.financeiros,
        // colaboradores: item.colaboradores.map((colab) => ({
        //   id: colab.user.id,
        //   nome: colab.user.nome,
        // })),
      }));
      return data;
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }

  async getCorretores(data: GetCorretorDto) {
    try {
      const consultaFinanceira =
        await this.prismaService.read.financeiroEmpreendimento
          .findMany({
            where: {
              empreendimentoId: data.empreendimentoId,
            },
            select: {
              financeiro: {
                select: {
                  id: true,
                  fantasia: true,
                },
              },
            },
          })
          .then((res) => res.map((item) => item.financeiro));

      const req = await this.prismaService.read.user.findMany({
        where: {
          empreendimentos: {
            some: {
              empreendimentoId: data.empreendimentoId,
            },
          },
          construtoras: {
            some: {
              construtoraId: data.construtoraId,
            },
          },
          financeiros: {
            some: {
              financeiro: {
                id: {
                  in: consultaFinanceira.map((item) => item.id),
                },
              },
            },
          },
        },
        select: {
          id: true,
          nome: true,
        },
      });

      return {
        corretores: req,
        financeiros: consultaFinanceira,
      };
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }
}
