import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRelatorioDto } from './dto/relatorio.tdo';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { UpdateRelatorioFinanceiroDto } from './dto/update-relatorio_financeiro.dto';

@Injectable()
export class RelatorioFinanceiroService {
  constructor(
    private Prisma: PrismaService,
    private fcwebProvider: FcwebProvider,
  ) {}

  async create(data: CreateRelatorioDto) {
    try {
      const { ConstrutoraId, EmpreendimentoId, Inicio, Fim, SituacaoId } = data;

      const lista = await this.ListaSolicitacoes(
        ConstrutoraId,
        EmpreendimentoId,
        Inicio,
        Fim,
        SituacaoId,
      );

      const Dados = [];

      // verificar se andamento = 'REVOGADO', se for, verificar dt_revogacao - dt_aprovacao é maior que 6 dias, se for trazer no relatorio
      lista.forEach(async (solicitacao: any) => {
        if (solicitacao.id_fcw) {
          const fcweb = await this.GetAllFcweb(solicitacao.cpf);
          solicitacao.andamento = fcweb[0].andamento;
          solicitacao.dt_agendamento = fcweb[0].dt_agenda;
          solicitacao.hr_agendamento = fcweb[0].hr_agenda;
          solicitacao.dt_aprovacao = fcweb[0].dt_aprovacao;
          solicitacao.hr_aprovacao = fcweb[0].hr_aprovacao;
          solicitacao.dt_revogacao = fcweb[0].dt_revogacao;
          solicitacao.total = fcweb.length || 0;
          if (solicitacao.andamento === 'REVOGADO') {
            const dt_revogacao = new Date(solicitacao.dt_revogacao);
            const dt_aprovacao = new Date(solicitacao.dt_aprovacao);
            const diff = dt_revogacao.getTime() - dt_aprovacao.getTime();
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (diffDays > 6) {
              Dados.push(solicitacao);
            }
          } else {
            Dados.push(solicitacao);
          }
        }
      });

    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  findAll() {
    return `This action returns all relatorioFinanceiro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} relatorioFinanceiro`;
  }

  update(
    id: number,
    updateRelatorioFinanceiroDto: UpdateRelatorioFinanceiroDto,
  ) {
    return `This action updates a #${id} relatorioFinanceiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} relatorioFinanceiro`;
  }

  async RelatorioFinanceiro(data: CreateRelatorioDto) {
    const { ConstrutoraId, EmpreendimentoId, Inicio, Fim, SituacaoId } = data;

    const relatorio = await this.Prisma.solicitacao.findMany({
      where: {
        construtoraId: ConstrutoraId,
        situacao_pg: SituacaoId,
        ...(EmpreendimentoId && { empreendimentoId: EmpreendimentoId }),
        ...(Fim
          ? {
              createdAt: {
                gte: new Date(Inicio),
                lte: new Date(Fim),
              },
            }
          : {
              createdAt: {
                gte: new Date(Inicio),
              },
            }),
        andamento: {
          in: ['APROVADO', 'EMITIDO', 'REVOGADO'],
        },
        dt_aprovacao: {
          not: null,
        },
      },
    });

    return relatorio;
  }

  async ListaSolicitacoes(
    ConstrutoraId: number,
    EmpreendimentoId: number,
    Inicio: string,
    Fim: string,
    SituacaoId: number,
  ) {
    try {
      const relatorio = await this.Prisma.solicitacao.findMany({
        where: {
          construtoraId: ConstrutoraId,
          situacao_pg: SituacaoId,
          ...(EmpreendimentoId && { empreendimentoId: EmpreendimentoId }),
          ...(Fim
            ? {
                dt_aprovacao: {
                  gte: new Date(Inicio),
                  lte: new Date(Fim),
                },
              }
            : {
                dt_aprovacao: {
                  gte: new Date(Inicio),
                },
              }),
          andamento: {
            in: ['APROVADO', 'EMITIDO', 'REVOGADO'],
          },
        },
      });

      return relatorio;
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async UpdateSolicitacao(cpf: string) {
    try {
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async GetAllFcweb(cpf: string): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
    dt_revogacao: Date;
  }[]> {
    try {
      const fcweb = await this.fcwebProvider.findAllCpfMin(cpf);
      if (!fcweb) {
        throw new Error(`Registro com cpf ${cpf} não encontrado`);
      }
      return fcweb;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async GerarRelatorioPdf() {
    
  }
}
