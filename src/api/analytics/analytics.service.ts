import { Injectable } from '@nestjs/common';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FcwebReagendamentoProvider } from 'src/sequelize/providers/fcweb-reagendamento.provider';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private reagendamentoProvider: FcwebReagendamentoProvider,
  ) {}

  async getDashboardData(query: GetAnalyticsQueryDto) {
    const { startDate, endDate, construtoraId, financeiroId, corretorId } =
      query;

    const where: any = {
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      ...(construtoraId && { construtoraId }),
      ...(financeiroId && { financeiroId }),
      ...(corretorId && { corretorId }),
    };

    const solicitacoes = await this.prisma.solicitacao.findMany({
      where,
      select: {
        id: true,
        id_fcw: true,
        createdAt: true,
        dt_agendamento: true,
        dt_aprovacao: true,
        andamento: true,
        status_aprovacao: true,
        dt_revogacao: true,
        pause: true,
        gov: true,
        distrato: true,
        ativo: true,
        type_validacao: true,
        vouchers: {
          select: { id: true },
        },
      },
    });

    const idsFcw = solicitacoes
      .map((s) => s.id_fcw)
      .filter((id): id is number => id !== null);

    const totalReagendamentos =
      await this.reagendamentoProvider.countByFcwebIds(idsFcw);

    const metrics = this.processMetrics(solicitacoes);
    console.log('🚀 ~ AnalyticsService ~ getDashboardData ~ metrics:', metrics);

    return {
      ...metrics,
      totals: {
        ...metrics.totals,
        reagendamentos: totalReagendamentos,
      },
    };
  }

  private processMetrics(data: any[]) {
    const totals = {
      abertas: 0,
      emitidos: 0,
      revogado: 0,
      pausado: 0,
      enviado_gov: 0,
      distrato: 0,
      deletado: 0,
      video: 0,
      presencial: 0,
      presencial_externa: 0,
    };

    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    let sumMsAberturaAgendamento = 0;
    let countAgendamento = 0;
    let sumMsAgendamentoAprovacao = 0;
    let countAgendamentoAprovacao = 0;
    let sumMsAberturaAprovacao = 0;
    let countAprovacao = 0;

    const getFullTimestamp = (datePart: Date | null, timePart: Date | null) => {
      if (!datePart) return null;
      const combined = new Date(datePart);
      if (timePart) {
        const time = new Date(timePart);
        combined.setUTCHours(
          time.getUTCHours(),
          time.getUTCMinutes(),
          time.getUTCSeconds(),
          0,
        );
      }
      return combined.getTime() - THREE_HOURS_MS;
    };

    data.forEach((item) => {
      if (item.ativo === false) {
        totals.deletado++;
        return;
      }

      // --- CONTAGEM DE TOTAIS ---
      if (item.distrato) totals.distrato++;
      if (item.gov) totals.enviado_gov++;
      if (item.pause) totals.pausado++;
      const andamento = item.andamento?.toUpperCase();
      if (
        andamento === 'EMITIDO' ||
        andamento === 'APROVADO' ||
        item.dt_aprovacao
      )
        totals.emitidos++;
      if (!andamento && !item.pause && !item.distrato && !item.gov)
        totals.abertas++;

      const tipo = item.type_validacao?.toUpperCase() || '';
      if (tipo.includes('VIDEO')) {
        totals.video++;
      } else {
        if (item.vouchers && item.vouchers.length > 0) {
          totals.presencial_externa++;
        } else if (
          tipo.includes('INTERNA') ||
          tipo.includes('EXTERNA') ||
          tipo !== ''
        ) {
          totals.presencial++;
        }
      }

      // T1: ABERTURA
      const tAbertura = new Date(item.createdAt).getTime() - THREE_HOURS_MS;

      // T2: AGENDAMENTO
      const tAgendamento = getFullTimestamp(
        item.dt_agendamento,
        item.hr_agendamento,
      );

      // T3: APROVAÇÃO
      const tAprovacao = getFullTimestamp(item.dt_aprovacao, item.hr_aprovacao);

      if (tAgendamento) {
        // CONTA 1: Abertura -> Agendamento
        const businessDiff1 = this.getBusinessTimeDiff(tAbertura, tAgendamento);
        sumMsAberturaAgendamento += businessDiff1;
        countAgendamento++;

        if (tAprovacao) {
          // CONTA 2: Agendamento -> Aprovação
          const businessDiff2 = this.getBusinessTimeDiff(
            tAgendamento,
            tAprovacao,
          );
          sumMsAgendamentoAprovacao += businessDiff2;
          countAgendamentoAprovacao++;

          // CONTA 3: Abertura -> Aprovação
          const businessDiff3 = this.getBusinessTimeDiff(tAbertura, tAprovacao);
          sumMsAberturaAprovacao += businessDiff3;
          countAprovacao++;
        }
      }
    });

    const formatToClock = (totalMs: number, count: number) => {
      if (count === 0) return '00h 00min';
      const averageMs = totalMs / count;
      const totalMinutes = Math.floor(averageMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}min`;
    };

    return {
      totals,
      medias_nato: {
        abertura_para_agendamento: formatToClock(
          sumMsAberturaAgendamento,
          countAgendamento,
        ),
        agendamento_para_aprovacao: formatToClock(
          sumMsAgendamentoAprovacao,
          countAgendamentoAprovacao,
        ),
        abertura_para_aprovacao: formatToClock(
          sumMsAberturaAprovacao,
          countAprovacao,
        ),
      },
    };
  }

  private getBusinessTimeDiff(startDateMs: number, endDateMs: number): number {
    if (endDateMs <= startDateMs) return 0;

    let totalMs = 0;
    let currentPtr = new Date(startDateMs);
    const end = new Date(endDateMs);

    if (currentPtr.toDateString() === end.toDateString()) {
      const day = currentPtr.getDay();
      if (day === 0 || day === 6) return 0;
      return endDateMs - startDateMs;
    }

    let tempStart = startDateMs;

    while (tempStart < endDateMs) {
      const currentDate = new Date(tempStart);
      const dayOfWeek = currentDate.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        const endOfDay = new Date(currentDate).setUTCHours(23, 59, 59, 999);
        const nextStep = Math.min(endDateMs, endOfDay);

        totalMs += nextStep - tempStart;
      }

      const nextDay = new Date(currentDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      nextDay.setUTCHours(0, 0, 0, 0);
      tempStart = nextDay.getTime();
    }

    return totalMs;
  }

  async getRankingData(query: GetAnalyticsQueryDto) {
    const { startDate, endDate, construtoraId, financeiroId } = query;

    // Filtro base de data e ativos
    const where: any = {
      ativo: true,
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      ...(construtoraId && { construtoraId }),
      ...(financeiroId && { financeiroId }),
      OR: [
        { andamento: 'EMITIDO' },
        { andamento: 'APROVADO' },
        { dt_aprovacao: { not: null } },
      ],
    };

    const [construtoras, financeiras, corretores, todosOsLogins] =
      await Promise.all([
        this.prisma.solicitacao.groupBy({
          by: ['construtoraId'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        this.prisma.solicitacao.groupBy({
          by: ['financeiroId'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        this.prisma.solicitacao.groupBy({
          by: ['corretorId'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        this.prisma.userlogin.findMany({
          where: {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          },
          include: {
            user: {
              select: {
                role: true,
                construtoras: {
                  select: {
                    construtora: {
                      select: { fantasia: true, razaosocial: true },
                    },
                  },
                },
                financeiros: {
                  select: {
                    financeiro: {
                      select: { fantasia: true, razaosocial: true },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);
    const contagemAcessos: Record<
      string,
      {
        name: string;
        total: number;
        construtoras: string[];
        financeiras: string[];
      }
    > = {};

    todosOsLogins.forEach((login) => {
      const userRole = login.user?.role as any;

      if (userRole && userRole.adm === true) {
        return;
      }

      const chave = String(login.userId);
      if (!contagemAcessos[chave]) {
        const listaConstrutoras =
          login.user?.construtoras?.map(
            (c) =>
              c.construtora?.fantasia || c.construtora?.razaosocial || 'N/I',
          ) || [];

        const listaFinanceiras =
          login.user?.financeiros?.map(
            (f) => f.financeiro?.fantasia || f.financeiro?.razaosocial || 'N/I',
          ) || [];

        contagemAcessos[chave] = {
          name: login.nome || 'Usuário Sem Nome',
          total: 0,
          construtoras: listaConstrutoras,
          financeiras: listaFinanceiras,
        };
      }
      contagemAcessos[chave].total++;
    });

    const topAcessos = Object.values(contagemAcessos)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const rankingsOriginais = await this.mapRankingNames(
      construtoras,
      financeiras,
      corretores,
    );

    return {
      ...rankingsOriginais,
      acessos: topAcessos,
    };
  }

  private async mapRankingNames(
    construtoras: any[],
    financeiras: any[],
    corretores: any[],
  ) {
    const cIds = construtoras.map((c) => c.construtoraId).filter(Boolean);
    const fIds = financeiras.map((f) => f.financeiroId).filter(Boolean);
    const uIds = corretores.map((u) => u.corretorId).filter(Boolean);

    const cNames = await this.prisma.construtora.findMany({
      where: { id: { in: cIds } },
      select: { id: true, fantasia: true, razaosocial: true },
    });

    const fNames = await this.prisma.financeiro.findMany({
      where: { id: { in: fIds } },
      select: { id: true, fantasia: true, razaosocial: true },
    });

    const uNames = await this.prisma.user.findMany({
      where: { id: { in: uIds } },
      select: { id: true, nome: true },
    });

    return {
      construtoras: construtoras.map((c) => ({
        name:
          cNames.find((n) => n.id === c.construtoraId)?.fantasia ||
          cNames.find((n) => n.id === c.construtoraId)?.razaosocial ||
          'Não Identificada',
        total: c._count.id,
      })),
      financeiras: financeiras.map((f) => ({
        name:
          fNames.find((n) => n.id === f.financeiroId)?.fantasia ||
          fNames.find((n) => n.id === f.financeiroId)?.razaosocial ||
          'Não Identificada',
        total: f._count.id,
      })),
      corretores: corretores.map((u) => ({
        name: uNames.find((n) => n.id === u.corretorId)?.nome || 'Sistema',
        total: u._count.id,
      })),
    };
  }
}
