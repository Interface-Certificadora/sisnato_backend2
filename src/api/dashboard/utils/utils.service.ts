// utils.service.ts
import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FiltroDashboardDto } from '../dto/filtro-dashboard.dto';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { solicitacoesSearchEntity } from './entities/utils.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private fcwebProvider: FcwebProvider,
  ) {}

  // --- NOVO MÉTODO OTIMIZADO PARA O DASHBOARD PRINCIPAL ---
  async getDashboardData() {
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const solicitacoes = await this.prisma.solicitacao.findMany({
      where: {
        dt_aprovacao: { gte: seisMesesAtras },
        andamento: { in: ['EMITIDO'] },
        ativo: true,
        distrato: false,
      },
      select: {
        id: true,
        dt_aprovacao: true,
        type_validacao: true,
        createdAt: true,
        uploadCnh: true,
        uploadRg: true,
      },
    });

    const stats = solicitacoes.reduce((acc, item) => {
      if (!item.dt_aprovacao) return acc;

      const date = new Date(item.dt_aprovacao);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!acc[key]) {
        acc[key] = {
          total: 0,
          video: 0,
          presencial: 0,
          cnh: 0,
          rg: 0,
          totalMs: 0,
        };
      }

      acc[key].total++;

      const type = item.type_validacao || '';
      if (type.includes('VIDEO')) acc[key].video++;
      else acc[key].presencial++;

      if (item.uploadCnh) acc[key].cnh++;
      else acc[key].rg++;

      const diff = this.calculateBusinessTime(new Date(item.createdAt), date);
      acc[key].totalMs += diff > 0 ? diff : 0;

      return acc;
    }, {});

    return Object.entries(stats)
      .map(([label, val]: any) => ({
        label,
        mes: parseInt(label.split('-')[1]),
        ano: parseInt(label.split('-')[0]),
        ...val,
        mediaHoras: this.formatMs(val.totalMs / val.total),
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Ordena por data
  }

  // --- MANTÉM OS MÉTODOS ABAIXO PARA O SEARCH E TAGS ---

  async GetAlertasCreated() {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth() - 6, 1);

    const data = await this.prisma.tag.findMany({
      where: { createAt: { gte: firstDay } },
    });

    const arrTags = data.reduce((acc, item) => {
      const tagExistente = acc.find((tag) => tag.descricao === item.descricao);
      if (tagExistente) tagExistente.quantidade++;
      else acc.push({ descricao: item.descricao, quantidade: 1 });
      return acc;
    }, []);

    return {
      total_tags: data.length,
      lista_tags: arrTags.sort((a, b) => b.quantidade - a.quantidade),
    };
  }

  async GetSolicitacoesSearch(filtro: FiltroDashboardDto) {
    const { dataInicio, dataFim, empreedimento, financeiro, construtora } =
      filtro;

    const where: any = {
      andamento: { in: ['EMITIDO', 'APROVADO'] },
      ativo: true,
      distrato: false,
      id_fcw: { not: null },
    };

    if (dataInicio || dataFim) {
      where.dt_aprovacao = {};
      if (dataInicio) where.dt_aprovacao.gte = dataInicio;
      if (dataFim) where.dt_aprovacao.lte = dataFim;
    }

    if (empreedimento) where.empreendimentoId = empreedimento;
    if (financeiro) where.financeiroId = financeiro;
    if (construtora) where.construtoraId = construtora;

    const solicitacoes = await this.prisma.solicitacao.findMany({
      where,
      include: {
        tags: { select: { descricao: true } },
      },
    });

    // Busca dados complementares do FCWEB em lote para performance
    const idsFcw = solicitacoes.map((s) => s.id_fcw).filter(Boolean);
    const fcwebs = await this.fcwebProvider.findManyByIds(idsFcw);
    const fcwebMap = new Map(fcwebs.map((f) => [f.id, f]));

    const formatadas = solicitacoes.map((s) => ({
      ...s,
      tags: s.tags.map((t) => t.descricao),
      fcweb: fcwebMap.get(s.id_fcw) || null,
    }));

    return plainToInstance(solicitacoesSearchEntity, formatadas);
  }

  async ContabilizarSuporte(solicitacoes: any[]) {
    // Busca suportes relacionados a essas solicitações
    const ids = solicitacoes.map((s) => s.id);
    const suportes = await this.prisma.suporte.findMany({
      where: { solicitacao: { in: ids } },
    });

    const contagem = suportes.reduce((acc, curr) => {
      acc[curr.tag] = (acc[curr.tag] || 0) + 1;
      return acc;
    }, {});

    const lista = Object.entries(contagem)
      .map(([tag, qtd]) => `${tag} = ${qtd}`)
      .sort((a, b) => parseInt(b.split('=')[1]) - parseInt(a.split('=')[1]))
      .slice(0, 5);

    return {
      total_suporte: suportes.length,
      lista_suporte: lista,
      total_tag: 0, // Ajuste conforme sua lógica de tags de erro
      lista_tags: [],
    };
  }

  async TimeOutMes(solicitacoes: any[]) {
    if (!solicitacoes.length) return '00:00:00';
    let totalMs = 0;

    solicitacoes.forEach((s) => {
      const diff = this.calculateBusinessTime(
        new Date(s.createdAt),
        new Date(s.dt_aprovacao),
      );
      totalMs += diff > 0 ? diff : 0;
    });

    return this.formatMs(totalMs / solicitacoes.length);
  }

  private formatMs(ms: number) {
    if (!ms || isNaN(ms)) return '0h 0m';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  private calculateBusinessTime(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) return 0;

    let totalMs = endDate.getTime() - startDate.getTime();
    let weekendMs = 0;

    const tempDate = new Date(startDate);
    tempDate.setHours(0, 0, 0, 0);

    while (tempDate <= endDate) {
      const dayOfWeek = tempDate.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const startOfWindow = new Date(tempDate);
        const endOfWindow = new Date(tempDate);
        endOfWindow.setHours(23, 59, 59, 999);

        const actualStart =
          startDate > startOfWindow ? startDate : startOfWindow;
        const actualEnd = endDate < endOfWindow ? endDate : endOfWindow;

        if (actualStart < actualEnd) {
          weekendMs += actualEnd.getTime() - actualStart.getTime();
        }
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const finalMs = totalMs - weekendMs;
    return finalMs > 0 ? finalMs : 0;
  }
}
