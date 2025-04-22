import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MesesEntity, solicitacoesEntity } from './entities/utils.entity';
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

  async ContabilizarMes(dados: solicitacoesEntity[]) {
    try {
      const contagem = {};

      dados.forEach((item) => {
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

        return {
          ano: parseInt(ano),
          mes: parseInt(mes),
          total: contagem[chave].total,
          solicitacoes: ids,
          mediaHoras: formatarHoras(mediaHoras),
          videoConferencia: contagemValidacoes.Video_Conferencia,
          interna: contagemValidacoes.Interna,
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

function countSundaysBetweenDates(startDate: Date, endDate: Date) {
  let count = 0;

  // Iterar do início ao fim
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    if (date.getDay() === 0) {
      count++; // Incrementar se for domingo
    }
  }

  return count;
}
