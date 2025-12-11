import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MesesEntity,
  solicitacoesEntity,
  solicitacoesSearchEntity,
} from './entities/utils.entity';
import { ErrorDashboardEntity } from '../entities/dashboard.error.entity';
import { FiltroDashboardDto } from '../dto/filtro-dashboard.dto';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UtilsService {
  constructor(
    private readonly prismaService: PrismaService,
    private FcwebProvider: FcwebProvider,
  ) {}

  async GetSolicitacaoPorMeses(meses: MesesEntity[]) {
    try {
      const whereConditions = meses.map(({ mes, ano }) => ({
        dt_aprovacao: {
          gte: new Date(ano, mes - 1, 1),
          lte: new Date(ano, mes, 0),
        },
        andamento: {
          in: ['APROVADO', 'EMITIDO'],
        },
        ativo: true,
        distrato: false,
        direto: false,
      }));

      const todasAsSolicitacoes = await this.prismaService.solicitacao.findMany(
        {
          where: {
            OR: whereConditions,
          },
          select: {
            id: true,
            createdAt: true,
            andamento: true,
            type_validacao: true,
            dt_aprovacao: true,
            hr_aprovacao: true,
            dt_agendamento: true,
            hr_agendamento: true,
            id_fcw: true,
            uploadCnh: true,
            uploadRg: true,
          },
        },
      );

      const itensFcw = todasAsSolicitacoes
        .filter((item) => item.hr_aprovacao)
        .map((item) => item.id);

      const dataFormatada = await Promise.all(
        todasAsSolicitacoes.map(formatarSolicitacao),
      );

      return dataFormatada;
    } catch (error) {
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async ContabilizarMes(dados: solicitacoesEntity[]) {
    try {
      const contagem = {};

      dados.forEach((item) => {
        // console.log('🚀 ~ UtilsService ~ dados.forEach ~ item:', item);
        const [ano, mes, dia] = item.dt_aprovacao_formatada
          .split('-')
          .map(Number);

        const chave = `${ano}-${mes < 10 ? `0${mes}` : mes}`;

        if (!contagem[chave]) {
          contagem[chave] = {
            total: 0,
            ids: [],
            tipoValidacao: {},
            tipoDoc: {},
          };
        }

        // Contabilizo o tipo de como foi feita a validação validação
        contagem[chave].total++;
        contagem[chave].ids.push(item.id);

        const tipo = item.type_validacao;
        if (!contagem[chave].tipoValidacao[tipo]) {
          contagem[chave].tipoValidacao[tipo] = 0;
        }
        contagem[chave].tipoValidacao[tipo]++;

        // Contabilizar o tipo de documento, se é 'RG' ou 'CNH'

        const docType = item.typeDoc;
        if (!contagem[chave].tipoDoc[docType]) {
          contagem[chave].tipoDoc[docType] = 0;
        }
        contagem[chave].tipoDoc[docType]++;
      });

      const resultados = Object.keys(contagem).map((chave) => {
        const [ano, mes] = chave.split('-');
        const ids = contagem[chave].ids;

        const itensMes = dados.filter((item) => ids.includes(item.id));

        let totalhoras = 0;

        itensMes.forEach((item) => {
          if (!item.hr_aprovacao) {
            const aprovacao = item.hr_agendamento_formatada;
            const [horas, minutos, segundos] = aprovacao.split(':').map(Number);
            const data = new Date();
            data.setHours(horas, minutos, segundos);

            data.setMinutes(data.getMinutes() + 15);
            const novoHorario = data.toISOString().split('T')[1].split('.')[0];

            item.hr_aprovacao_formatada = novoHorario;
          }

          const dataCriacao = new Date(
            item.createdAt.setHours(item.createdAt.getHours() - 3),
          );

          const dataAlternativa = new Date(
            item.createdAt.setHours(item.createdAt.getHours() - 6),
          );

          const aprovacao = item.dt_aprovacao_formatada
            ? new Date(
                `${item.dt_aprovacao_formatada}T${item.hr_aprovacao_formatada}`,
              )
            : dataAlternativa;

          aprovacao.setHours(aprovacao.getHours() - 3);

          let dataAprovacao = aprovacao.getTime();

          const domingos = countSundaysBetweenDates(dataCriacao, aprovacao);
          const hrsDomingos = domingos * 24;
          const msDomingos = hrsDomingos * 60 * 60 * 1000;

          if (domingos > 0) {
            dataAprovacao -= msDomingos;
          }

          const diferencaHoras = dataAprovacao - dataCriacao.getTime();

          if (diferencaHoras < 0) {
            totalhoras += 0;
          } else {
            totalhoras += diferencaHoras;
          }
        });
        const mediaHoras = totalhoras / contagem[chave].total;

        const formatarHoras = (horas: number) => {
          const time = new Date(horas)
            .toISOString()
            .split('T')[1]
            .split('.')[0];
          return time;
        };

        const tipoValidacao = (data: number) => {
          const result = {
            Video_Conferencia: 0,
            Interna: 0,
          };

          for (const [key, value] of Object.entries(data)) {
            if (key === 'INTERNA') {
              result.Interna += value;
            } else {
              result.Video_Conferencia += value;
            }
          }
          return result;
        };
        const contagemValidacoes = tipoValidacao(contagem[chave].tipoValidacao);

        const tipoDoc = (data: number) => {
          const result = {
            RG: 0,
            CNH: 0,
          };

          for (const [x, y] of Object.entries(data)) {
            if (x === 'RG') {
              result.RG += y;
            } else {
              result.CNH += y;
            }
          }
          return result;
        };
        const contagemDoc = tipoDoc(contagem[chave].tipoDoc);

        const videoConferenciaOriginal = contagemValidacoes.Video_Conferencia;
        const internaOriginal = contagemValidacoes.Interna;

        const ajuste = Math.round(videoConferenciaOriginal * 0.1);

        const videoConferenciaAjustado = videoConferenciaOriginal - ajuste;
        const internaAjustado = internaOriginal + ajuste;

        return {
          ano: parseInt(ano),
          mes: parseInt(mes),
          total: contagem[chave].total,
          solicitacoes: ids,
          mediaHoras: formatarHoras(mediaHoras),
          videoConferencia: videoConferenciaAjustado,
          interna: internaAjustado,
          RG: contagemDoc.RG,
          CNH: contagemDoc.CNH,
        };
      });

      return resultados;
    } catch (error) {
      console.log(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async GetAlertasCreated() {
    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth() - 6, 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const data = await this.prismaService.tag.findMany({
        where: {
          createAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      });

      const arrTags = data.reduce((acc, item) => {
        const tagExistente = acc.find(
          (tag) => tag.descricao === item.descricao,
        );

        if (tagExistente) {
          tagExistente.quantidade += 1;
        } else {
          acc.push({
            descricao: item.descricao,
            quantidade: 1,
          });
        }
        return acc;
      }, []);

      const totalTags = arrTags.reduce((acc, item) => acc + item.quantidade, 0);
      return {
        total_tags: totalTags,
        lista_tags: arrTags,
      };
    } catch (error) {
      console.log(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async GetSolicitacoesSearch(Filtro: FiltroDashboardDto) {
    try {
      const { dataInicio, dataFim, empreedimento, financeiro, construtora } =
        Filtro;

      const where: any = {
        andamento: {
          in: ['EMITIDO', 'APROVADO'],
        },
        ativo: true,
        distrato: false,
        id_fcw: {
          not: null,
        },
      };

      if (dataInicio && dataFim) {
        where.dt_aprovacao = { gte: dataInicio, lte: dataFim };
      } else if (dataInicio) {
        where.dt_aprovacao = { gte: dataInicio };
      } else if (dataFim) {
        where.dt_aprovacao = { lte: dataFim };
      }

      if (empreedimento) where.empreendimento = { id: empreedimento };
      if (financeiro) where.financeiro = { id: financeiro };
      if (construtora) where.construtora = { id: construtora };

      const solicitacoes = await this.prismaService.solicitacao.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          andamento: true,
          type_validacao: true,
          dt_aprovacao: true,
          hr_aprovacao: true,
          dt_agendamento: true,
          hr_agendamento: true,
          id_fcw: true,
        },
      });

      const ids = solicitacoes.map((s) => s.id);
      const idFcw = solicitacoes.map((s) => s.id_fcw).filter(Boolean);

      const [tags, suportes, fcwebs] = await Promise.all([
        this.prismaService.tag.findMany({
          where: { solicitacao: { in: ids } },
          select: { solicitacao: true, descricao: true },
        }),
        this.prismaService.suporte.findMany({
          where: { solicitacao: { in: ids } },
          select: { solicitacao: true, tag: true },
        }),
        this.FcwebProvider.findManyByIds(idFcw),
      ]);

      const groupBy = <T>(arr: T[], key: keyof T) =>
        arr.reduce(
          (acc, item) => {
            const k = item[key] as any;
            acc[k] = acc[k] || [];
            acc[k].push(item);
            return acc;
          },
          {} as Record<any, T[]>,
        );

      const tagsMap = groupBy(tags, 'solicitacao');
      const suporteMap = groupBy(suportes, 'solicitacao');
      const fcwebMap = fcwebs.reduce(
        (acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        },
        {} as Record<number, any>,
      );

      const solicitacoesFinal = solicitacoes.map((item) => ({
        ...item,
        tags: (tagsMap[item.id] || []).map((t) => t.descricao),
        suporte: (suporteMap[item.id] || []).map((s) => s.tag),
        fcweb: fcwebMap[item.id_fcw] || null,
      }));

      return plainToInstance(solicitacoesSearchEntity, solicitacoesFinal);
    } catch (error) {
      console.error(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message || 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async TimeOutMes(solicitacoes: solicitacoesSearchEntity[]): Promise<string> {
    try {
      if (!solicitacoes || solicitacoes.length === 0) {
        return '0h 0m';
      }

      let totalHoras = 0;

      for (let i = 0; i < solicitacoes.length; i++) {
        const item = solicitacoes[i];

        ajustarHoraAprovacao(item);

        const dataCriacao = new Date(item.createdAt);

        if (item.dt_aprovacao && item.hr_aprovacao) {
          const aprovacao = new Date(
            `${item.dt_aprovacao.toISOString().split('T')[0]}T${item.hr_aprovacao.toISOString().split('T')[1].split('.')[0]}`,
          );
          aprovacao.setHours(aprovacao.getHours() - 3); // Ajusta para o horário correto (UTC-3)
          const diferencaHoras = calcularDiferencaHoras(aprovacao, dataCriacao);
          totalHoras += diferencaHoras;
        }
      }

      totalHoras = totalHoras / solicitacoes.length;

      return formatarHoras(totalHoras);
    } catch (error) {
      console.error('Erro ao calcular o tempo:', error);
      throw new Error('Erro ao calcular o tempo. Tente novamente mais tarde.');
    }
  }

  async ContabilizarSuporte(data: solicitacoesSearchEntity[]) {
    try {
      const listaSuporte: string[] = [];
      const listaTags: string[] = [];

      for (const item of data) {
        const { suporte = [], tags = [] } = item;

        for (const s of suporte) {
          listaSuporte.push(s);
        }

        for (const t of tags) {
          listaTags.push(t);
        }
      }

      const contagem = listaSuporte.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item] = (acc[item] || 0) + 1;
          return acc;
        },
        {},
      );

      const contagem2 = listaTags.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item] = (acc[item] || 0) + 1;
          return acc;
        },
        {},
      );

      const top5Suporte = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([item, quantidade]) => `${item} = ${quantidade}`);

      const top5Tags = Object.entries(contagem2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([item, quantidade]) => `${item} = ${quantidade}`);

      return {
        total_suporte: listaSuporte.length,
        lista_suporte: top5Suporte,
        total_tag: listaTags.length,
        lista_tags: top5Tags,
      };
    } catch (error) {
      console.error('Erro ao contabilizar suporte e tags:', error);
      throw new Error('Erro ao processar dados de suporte/tags.');
    }
  }
}

async function formatarSolicitacao(solicitacao: any): Promise<any> {
  const formatted = { ...solicitacao };

  if (solicitacao.dt_aprovacao) {
    formatted.dt_aprovacao_formatada = solicitacao.dt_aprovacao
      .toISOString()
      .split('T')[0];
  }

  if (solicitacao.hr_aprovacao) {
    formatted.hr_aprovacao_formatada = solicitacao.hr_aprovacao
      .toISOString()
      .split('T')[1]
      .split('.')[0];
  } else {
    formatted.hr_aprovacao_formatada = '14:30:00';
  }

  if (solicitacao.dt_agendamento) {
    formatted.dt_agendamento_formatada = solicitacao.dt_agendamento
      .toISOString()
      .split('T')[0];
  }

  if (solicitacao.hr_agendamento) {
    formatted.hr_agendamento_formatada = solicitacao.hr_agendamento
      .toISOString()
      .split('T')[1]
      .split('.')[0];
  } else {
    formatted.hr_agendamento_formatada = '14:10:00';
  }

  if (solicitacao.id_fcw) {
    formatted.typeDoc = await GetDocType(solicitacao);
  }

  return formatted;
}

async function GetDocType(solicitacao: any) {
  if (solicitacao.uploadCnh) {
    return 'CNH';
  } else if (solicitacao.uploadRg) {
    return 'RG';
  } else {
    return 'CNH';
  }
}

function countSundaysBetweenDates(startDate: Date, endDate: Date) {
  let count = 0;

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    if (date.getDay() === 0) {
      count++;
    }
  }

  return count;
}

function calcularDiferencaHoras(
  dataAprovacao: Date,
  dataCriacao: Date,
): number {
  return (dataAprovacao.getTime() - dataCriacao.getTime()) / (1000 * 60 * 60);
}

function ajustarHoraAprovacao(item: solicitacoesSearchEntity) {
  if (!item.hr_aprovacao && item.hr_agendamento) {
    const [horas, minutos, segundos] = item.hr_agendamento
      .toISOString()
      .split(':')
      .map(Number);
    const dataAprovacao = new Date(item.dt_agendamento);
    dataAprovacao.setHours(horas, minutos, segundos);
    dataAprovacao.setMinutes(dataAprovacao.getMinutes() + 15);
    item.hr_aprovacao = dataAprovacao;
  }
}

const formatarHoras = (milissegundos: number) => {
  const segundosTotais = Math.floor(milissegundos / 1000);
  const horas = Math.floor(segundosTotais / 3600);
  const minutos = Math.floor((segundosTotais % 3600) / 60);
  const segundos = segundosTotais % 60;

  // PadStart garante que fique "05" ao invés de "5"
  const h = horas.toString().padStart(2, '0');
  const m = minutos.toString().padStart(2, '0');
  const s = segundos.toString().padStart(2, '0');

  return `${h}:${m}:${s}`;
};
