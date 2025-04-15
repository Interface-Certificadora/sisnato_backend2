import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MesesEntity } from './entities/utils.entity';
import { ErrorDashboardEntity } from '../entities/dashboard.error.entity';

@Injectable()
export class UtilsService {
  constructor(private readonly prismaService: PrismaService) {}

  async GetSolicitacaoPorMeses(meses: MesesEntity[]) {
    try {
      const solicitacoes = await Promise.all(
        meses.map(
          async ({ mes, ano }) =>
            await this.prismaService.solicitacao.findMany({
              where: {
                dt_aprovacao: {
                  gte: new Date(ano, mes - 1, 1),
                  lte: new Date(ano, mes, 0),
                },
                andamento: {
                  in: ['APROVADO', 'EMITIDO'],
                },
                ativo: true,
                distrato: false,
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
            }),
        ),
      );

      const data = await Promise.all(
        solicitacoes.map(async (subArray) => {
          return Promise.all(subArray.map(formatarSolicitacao));
        }),
      );

      return data.flat();
    } catch (error) {
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async ContabilizarMes(dados: any) {
    try {
      const contagem = {};

      dados.forEach((item) => {
        console.log(
          '🚀 ~ UtilsService ~ dados.forEach ~ item:',
          item.dt_aprovacao_formatada,
        );
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

        const doc = item.typeDoc;
        if (!contagem[chave].tipoDoc[doc]) {
          contagem[chave].tipoDoc[doc] = 0;
        }
      });

      const resultados = Object.keys(contagem).map((chave) => {
        const [ano, mes] = chave.split('-');
        const ids = contagem[chave].ids;

        const itensMes = dados.filter((item) => {
          ids.includes(item.id);
        });

        let totalhoras = 0;

        itensMes.forEach((item) => {
          if (!item.ht_aprovacao_formatada) {
            const aprovacao = item.hr_agendamento_formatada;
            const [horas, minutos, segundos] = aprovacao.split(':').map(Number);
            const data = new Date();
            data.setHours(horas, minutos, segundos);

            data.setMinutes(data.getMinutes() + 15);
            console.log('🚀 ~ itensMes.forEach ~ data:', data);
            const novoHorario = data.toISOString().split('T')[1].split('.')[0];
            console.log('🚀 ~ itensMes.forEach ~ novoHorario:', novoHorario);
          }
        });
      });
    } catch (error) {
      console.log(error);
      const retorno: ErrorDashboardEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
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
