import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';
import { GetInfoTermos } from './entities/get-info.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GetInfoSolicitacaoEntity } from './entities/get-info-solicitacao-entity';

@Injectable()
export class GetInfosService {
  constructor(private prismaService: PrismaService) {}
  async checkCpf(cpf: string, user: any) {
    try {
      if (user.hierarquia === 'ADM') {
        const Exist = await this.prismaService.solicitacao.findMany({
          where: {
            cpf: cpf,
          },
        });
        if (Exist && Exist.length > 0) {
          return plainToInstance(GetInfoSolicitacaoEntity, Exist, {});
        }

        return [];
      }
      const Exist = await this.prismaService.solicitacao.findMany({
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
      await this.prismaService.$disconnect();
    }
  }

  async getTermos() {
    try {
      const req = await this.prismaService.termo.findFirst();
      return req.termo;
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
  async getPoliticas(): Promise<GetInfoTermos> {
    try {
      const req = await this.prismaService.termo.findFirst({
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
      await this.prismaService.$disconnect();
    }
  }

  async getOptionsAdmin() {
    try {
      const req = await this.prismaService.construtora.findMany({
        select: {
          id: true,
          fantasia: true,
          empreendimentos: {
            select: {
              id: true,
              nome: true,
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
          colaboradores: {
            select: {
              user: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
        },
      });
      return req.map((item) => ({
        id: item.id,
        fantasia: item.fantasia,
        empreendimentos: item.empreendimentos,
        financeiros: item.financeiros,
        colaboradores: item.colaboradores.map((colab) => ({
          id: colab.user.id,
          nome: colab.user.nome,
        })),
      }));
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async getOptionsUser(user: any) {
    try {
      console.log(user);
      const req = await this.prismaService.construtora.findMany({
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
      const reste = req.map((item) => ({
        id: item.id,
        fantasia: item.fantasia,
        empreendimentos: item.empreendimentos,
        financeiros: item.financeiros,
        // colaboradores: item.colaboradores.map((colab) => ({
        //   id: colab.user.id,
        //   nome: colab.user.nome,
        // })),
      }));
      console.log('🚀 ~ GetInfosService ~ reste ~ reste:', reste);
      return req;
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
