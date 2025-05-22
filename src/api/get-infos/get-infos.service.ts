import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';
import { GetInfoTermos } from './entities/get-info.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GetInfoSolicitacaoEntity } from './entities/get-info-solicitacao-entity';

@Injectable()
export class GetInfosService {
  constructor(private prismaService: PrismaService) {}
  async checkCpf(cpf: string) {
    console.log('🚀 ~ GetInfosService ~ checkCpf ~ cpf:', cpf);
    try {
      const Exist = await this.prismaService.solicitacao.findMany({
        where: {
          cpf: cpf,
        },
      });
      console.log('🚀 ~ GetInfosService ~ checkCpf ~ Exist:', Exist);

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
      console.log('🚀 ~ GetInfosService ~ getTermos ~ req:', req);
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
