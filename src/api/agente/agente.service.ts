import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FcwebProvider } from '../../sequelize/providers/fcweb';
import { AgenteDisponibilidadeProvider } from 'src/sequelize/providers/agente-disponibilidade.provider';
import { AgendamentoProvider } from 'src/sequelize/providers/agendamento.provider';
import { format, addDays, getDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Holidays from 'date-holidays';

@Injectable()
export class AgenteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcwebProvider: FcwebProvider,
    private readonly disponibilidadeProvider: AgenteDisponibilidadeProvider,
    private readonly agendamentoProvider: AgendamentoProvider,
  ) {}

  async buscarClientePorTelefone(telefone: string) {
    try {
      const telefoneLimpo = telefone.replace(/\D/g, '');

      // 1. Busca TODAS as solicitações ativas e não distratadas do telefone
      const solicitacoes = await this.prisma.solicitacao.findMany({
        where: {
          telefone: {
            contains: telefoneLimpo,
          },
          ativo: true,
          distrato: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          nome: true,
          cpf: true,
          andamento: true,
          pg_status: true,
          id_fcw: true,
          direto: true,
        },
      });

      if (!solicitacoes || solicitacoes.length === 0) {
        return {
          existe: false,
          nome: null,
          documento: null,
          certificados: [],
          status: null,
        };
      }

      const principal = solicitacoes[0];

      // 2. Extrai de forma limpa todos os id_fcw válidos da lista de solicitações
      const idsFcw = solicitacoes
        .map((s) => s.id_fcw)
        .filter(
          (id): id is number => id !== null && id !== undefined && id > 0,
        );

      let certificadosMapeados = [];

      if (idsFcw.length > 0) {
        const buscasFcweb = idsFcw.map((id) =>
          this.fcwebProvider.findIdfMinRelat(id),
        );
        const resultadosFcweb = await Promise.all(buscasFcweb);

        certificadosMapeados = resultadosFcweb
          .filter((dados) => dados && dados.length > 0)
          .flatMap((dados) =>
            dados.map((cert) => ({
              id: cert.id,
              status_certificado: cert.andamento,
              modelo: cert.modelo,
              validacao: cert.validacao,
            })),
          );
      }

      if (certificadosMapeados.length === 0 && idsFcw.length > 0) {
        certificadosMapeados = idsFcw.map((id) => ({ id }));
      }

      // 3. Tradução do Status baseado na solicitação mais recente do cliente
      let statusTraduzido = 'aguardando validação';

      if (!principal.pg_status && principal.direto) {
        statusTraduzido = 'aguardando pagamento';
      } else if (
        principal.andamento === 'EMITIDO' ||
        principal.andamento === 'APROVADO'
      ) {
        statusTraduzido = 'concluído';
      } else if (principal.andamento === 'REVOGADO') {
        statusTraduzido = 'revogado';
      } else if (
        principal.andamento === 'REAGENDAMENTO' ||
        principal.andamento === 'NOVA FC' ||
        principal.andamento === 'REPRESAMENTO'
      ) {
        statusTraduzido = 'em emissão';
      }

      return {
        existe: true,
        nome: principal.nome,
        documento: principal.cpf,
        certificados: certificadosMapeados,
        status: statusTraduzido,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Erro interno ao mapear a esteira completa de certificados.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listarHorariosDisponiveis() {
    try {
      const diasSemanaMapa = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
      const TIMEZONE_BR = 'America/Sao_Paulo';

      const agoraSp = toZonedTime(new Date(), TIMEZONE_BR);

      // Inicializa a lib configurada para o Brasil ('BR')
      const hd = new Holidays('BR');

      // 1. Calcula dinamicamente as próximas 2 DATAS ÚTEIS/VÁLIDAS
      const datasAlvo: string[] = [];
      let diasSomados = 0;

      while (datasAlvo.length < 2) {
        const dataLoop = addDays(agoraSp, diasSomados);
        const diaSemanaIndex = getDay(dataLoop);

        // hd.isHoliday(data) retorna um array/objeto se for feriado, ou false se for dia normal
        const ehFeriado = hd.isHoliday(dataLoop);

        // Pula Domingos (0) e Feriados Nacionais/Estaduais detectados pela lib
        if (diaSemanaIndex === 0 || ehFeriado) {
          diasSomados++;
          continue;
        }

        datasAlvo.push(format(dataLoop, 'yyyy-MM-dd'));
        diasSomados++;
      }

      const hojeRealString = format(agoraSp, 'yyyy-MM-dd');
      const horaAtualString = format(agoraSp, 'HH:mm');

      // 2. Estrutura o mapa agrupado por Agente
      const agentesMapa: Record<
        number,
        {
          agente_id: number;
          agente_nome: string;
          agenda: Record<string, Set<string>>;
        }
      > = {};

      // 3. Executa a busca sequencial para cada um dos dois dias úteis localizados
      for (const dataString of datasAlvo) {
        const ehHojeReal = dataString === hojeRealString;
        const dataObjeto = parseISO(dataString);
        const diaSemanaTexto = diasSemanaMapa[getDay(dataObjeto)];

        const gradeBruta =
          await this.disponibilidadeProvider.buscarGradeDisponivel(
            diaSemanaTexto,
            'VIDEO CONF',
          );
        const ocupadosBruto =
          await this.agendamentoProvider.buscarHorariosOcupados(
            dataString,
            'VIDEO CONF',
          );

        gradeBruta.forEach((item) => {
          const { agente_id, agente_nome, hora } = item;
          const horaFormatada = hora.substring(0, 5);

          if (ehHojeReal && horaFormatada <= horaAtualString) {
            return;
          }

          const estaOcupado = ocupadosBruto.some(
            (oc) =>
              oc.agente_id === agente_id &&
              oc.hora_agendada.substring(0, 5) === horaFormatada,
          );

          if (!estaOcupado) {
            if (!agentesMapa[agente_id]) {
              agentesMapa[agente_id] = { agente_id, agente_nome, agenda: {} };
            }
            if (!agentesMapa[agente_id].agenda[dataString]) {
              agentesMapa[agente_id].agenda[dataString] = new Set<string>();
            }
            agentesMapa[agente_id].agenda[dataString].add(horaFormatada);
          }
        });
      }

      // 4. Formata a resposta no array final
      const respostaFormatada = Object.values(agentesMapa).map((ag) => {
        const agendaArray = Object.keys(ag.agenda)
          .sort((a, b) => a.localeCompare(b))
          .map((dataKey) => ({
            data: dataKey,
            modalidade: 'VIDEO CONF',
            horarios_disponiveis: Array.from(ag.agenda[dataKey]).sort((a, b) =>
              a.localeCompare(b),
            ),
          }));

        return {
          agente_id: ag.agente_id,
          agente_nome: ag.agente_nome,
          agenda: agendaArray,
        };
      });

      return respostaFormatada;
    } catch (error) {
      console.log('--- LOG DE ERRO CRÍTICO ---');
      console.log(error);
      console.log('---------------------------');

      throw new HttpException(
        {
          message:
            'Erro interno ao calcular grade com a biblioteca date-holidays.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
