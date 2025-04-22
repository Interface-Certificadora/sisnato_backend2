import { HttpException, Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorDashboardEntity } from './entities/dashboard.error.entity';
import { plainToClass } from 'class-transformer';
import { DashboardEmpreendimentoEntity } from './entities/dashboard.empreendimento.entity';
import { UtilsService } from './utils/utils.service';
import { solicitacoesEntity } from './utils/entities/utils.entity';
import { Dashboard } from './entities/dashboard.entity';

@Injectable()
export class DashboardService {
  constructor(
    private prismaService: PrismaService,
    private utils: UtilsService,
  ) {}

  async getEmpreendimentos() {
    try {
      const req = await this.prismaService.empreendimento.findMany({
        select: {
          id: true,
          nome: true,
        },
      });
      if (!req) {
        const retorno: ErrorDashboardEntity = {
          message: 'Nenhum empreendimento cadastrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) =>
        plainToClass(DashboardEmpreendimentoEntity, item),
      );
    } catch (error) {
      console.log(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async getConstrutoras() {
    try {
      const req = await this.prismaService.construtora.findMany({
        where: {
          id: {
            gt: 1,
          },
        },
        select: {
          id: true,
          fantasia: true,
        },
      });
      if (!req) {
        const retorno: ErrorDashboardEntity = {
          message: 'Nenhuma construtora cadastrada',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) =>
        plainToClass(DashboardEmpreendimentoEntity, item),
      );
    } catch (error) {
      console.log(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async getFinanceiras() {
    try {
      const req = await this.prismaService.financeiro.findMany({
        select: {
          id: true,
          fantasia: true,
        },
      });
      if (!req) {
        const retorno: ErrorDashboardEntity = {
          message: 'Nenhuma financeira cadastrada',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) =>
        plainToClass(DashboardEmpreendimentoEntity, item),
      );
    } catch (error) {
      console.log(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async getDashboard() {
    try {
      const dataAtual = new Date();
      const month = [];

      for (let i = 0; i < 6; i++) {
        const mes = dataAtual.getMonth() + 1;
        const ano = dataAtual.getFullYear();
        month.unshift({ mes: mes, ano: ano });
        dataAtual.setMonth(dataAtual.getMonth() - 1);
      }

      const solicitacoes: solicitacoesEntity[] =
        await this.utils.GetSolicitacaoPorMeses(month);

      const contagem = await this.utils.ContabilizarMes(solicitacoes);
      const tags = await this.utils.GetAlertasCreated();
      const dataFinal = {
        contagem,
        tags,
      };

      return plainToClass(Dashboard, dataFinal);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
