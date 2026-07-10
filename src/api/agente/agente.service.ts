import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FcwebProvider } from '../../sequelize/providers/fcweb';
import { AgenteDisponibilidadeProvider } from 'src/sequelize/providers/agente-disponibilidade.provider';
import { AgendamentoProvider } from 'src/sequelize/providers/agendamento.provider';
import { format, addDays, getDay, parseISO, addMinutes } from 'date-fns'; // Adicionado addMinutes aqui
import { toZonedTime } from 'date-fns-tz';
import Holidays from 'date-holidays';
import { CreateFcwebAgenteDto } from './dto/create-fcweb-agente.dto';
import { LogService } from 'src/log/log.service';
import { ErrorService } from 'src/error/error.service';

@Injectable()
export class AgenteService {
  private readonly logger = new Logger(AgenteService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcwebProvider: FcwebProvider,
    private readonly disponibilidadeProvider: AgenteDisponibilidadeProvider,
    private readonly agendamentoProvider: AgendamentoProvider,
    private readonly Log: LogService, // Injetado aqui para resolver o erro da linha 364
    private readonly LogError: ErrorService,
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

      const hd = new Holidays('BR');

      // 1. Calcula dinamicamente as próximas 2 DATAS ÚTEIS/VÁLIDAS
      const datasAlvo: string[] = [];
      let diasSomados = 0;

      while (datasAlvo.length < 2) {
        const dataLoop = addDays(agoraSp, diasSomados);
        const diaSemanaIndex = getDay(dataLoop);

        const ehFeriado = hd.isHoliday(dataLoop);

        if (diaSemanaIndex === 0 || ehFeriado) {
          diasSomados++;
          continue;
        }

        datasAlvo.push(format(dataLoop, 'yyyy-MM-dd'));
        diasSomados++;
      }

      const hojeRealString = format(agoraSp, 'yyyy-MM-dd');

      const dataComMinutosAdicionais = addMinutes(agoraSp, 40);
      const horaLimiteString = format(dataComMinutosAdicionais, 'HH:mm');

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

          // (Agora + 40 minutos)
          if (ehHojeReal && horaFormatada < horaLimiteString) {
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

  /**
   * Cria a FCWeb com as regras da IA e gera o Agendamento no Sequelize
   */
  async criarFcwebPeloAgente(dto: CreateFcwebAgenteDto, user: any) {
    try {
      // 1. Busca os dados da solicitação no SisNato
      const solicitacao = await this.prisma.solicitacao.findUnique({
        where: { id: dto.solicitacaoId },
        include: {
          empreendimento: true,
          corretor: true,
          construtora: true,
          financeiro: true,
        },
      });

      if (!solicitacao) {
        throw new NotFoundException('Solicitação não encontrada no SisNato.');
      }

      const dataHoraAtual = new Date();

      // Regra de validação do E-mail
      const emailBase = solicitacao.email?.trim().toLowerCase();
      const emailInformado = dto.emailInformado?.trim().toLowerCase();
      const mudouEmail = emailBase !== emailInformado;
      const observacaoEmail = mudouEmail
        ? `EMAIL INFORMADO PELO USUARIO: ${dto.emailInformado} (Diferente do cadastro original: ${solicitacao.email})`
        : `EMAIL INFORMADO PELO USUARIO: ${dto.emailInformado}`;

      const referencia = `${dataHoraAtual.toISOString().split('T')[0].split('-').reverse().join('-')}.${dataHoraAtual.toLocaleTimeString()}`;

      const obscont = [
        `criado por API-IA`,
        `ID-SISNATO=${solicitacao.id}`,
        `Empreendimento: ${solicitacao.empreendimento?.nome ?? '-'}`,
        `Corretor: ${solicitacao.corretor?.nome ?? '-'}`,
      ].join(' - ');

      // Regra de Valor
      const valorBruto =
        solicitacao.valorcd ||
        solicitacao.construtora?.valor_cert ||
        solicitacao.financeiro?.valor_cert ||
        0;
      const valorcdFormatado = valorBruto.toString().replace('.', ',');

      // 2. Monta o payload
      // 2. Payload limpo e correto alinhado ao novo Model e regras da IA
      const payloadFcweb = {
        referencia: referencia,
        dt_agenda: dto.dataAgendamento, // Data escolhida pela IA
        hr_agenda: dto.horaAgendamento, // Hora escolhida pela IA
        obs_agenda: '(Criado por IA-INOVSTAR- SISAG)', // OBS_AGENDAMENTO
        s_alerta: 'ATIVADO',
        andamento: 'NOVA FC',
        tipocd: 'A3PF Bird5000',
        validacao: 'VIDEO CONF',
        responsavel: dto.agenteNome,
        criou_fc: 'API-IA',
        valorcd: valorcdFormatado,
        formapgto: 'PENDURA',
        contador: 'NATO_',
        obscont: obscont,
        nome: solicitacao.nome,
        dtnascimento: dto.dt_nascimento,
        cpf: solicitacao.cpf,
        telefone: dto.telefone || solicitacao.telefone || '',
        reg_cnh: dto.registro_cnh || solicitacao.cnh || '',
        rg: dto.rg || '',
        email: dto.emailInformado,
        observacao: observacaoEmail,
        cidade: solicitacao.empreendimento?.cidade || '',

        // Defaults obrigatórios da lógica do ImportData (Não nulos no banco)
        solicitacao_trial: '',
        andamento_trial: '',
        vencimento_trial: '',
        reagendamento: '',
        status_renovacao: 0,
        createdAt: dataHoraAtual,
      };

      // 3. Insere a FCWeb no Sequelize
      const novaFicha = await this.fcwebProvider.create(payloadFcweb);

      if (!novaFicha || !novaFicha.id) {
        throw new Error('Erro ao gerar a ficha FCWeb no banco externo.');
      }

      // 4. Cria o Agendamento
      const payloadAgendamento = {
        fcweb_id: novaFicha.id,
        agente_id: dto.agenteId,
        data_agendada: dto.dataAgendamento,
        hora_agendada: dto.horaAgendamento,
        modalidade: 'VIDEO CONF',
      };

      await this.agendamentoProvider.create(payloadAgendamento);

      // 5. Atualiza a solicitação no Prisma
      await this.prisma.solicitacao.update({
        where: { id: solicitacao.id },
        data: {
          id_fcw: novaFicha.id,
          andamento: 'NOVA FC',
          type_validacao: 'VIDEO CONF',
          dt_agendamento: new Date(dto.dataAgendamento),
          // Se colheu CNH ou data de nascimento, persiste localmente também
          ...(dto.dt_nascimento && {
            dt_nascimento: new Date(dto.dt_nascimento),
          }),
          ...(dto.registro_cnh && { cnh: dto.registro_cnh }),
          // ...(mudouEmail && { email: dto.emailInformado }),
          ...(dto.telefone && { telefone: dto.telefone }),
        },
      });

      // 6. Registra no Log de Auditoria
      await this.Log.Post({
        User: user?.id || 999,
        EffectId: solicitacao.id,
        Rota: 'solicitacao',
        Descricao: `IA criou a FCWEB ${novaFicha.id} e realizou o agendamento para ${dto.dataAgendamento} às ${dto.horaAgendamento}. ${mudouEmail ? 'E-mail atualizado.' : ''}`,
      });

      return {
        success: true,
        message: 'FCWeb e Agendamento criados com sucesso pela IA.',
        id_fcw: novaFicha.id,
        emailAlterado: mudouEmail,
      };
    } catch (error) {
      const err = error as any;

      this.LogError.Post(JSON.stringify(err, null, 2));
      this.logger.error(
        'Erro na esteira de criação automática da IA:',
        err.message,
      );

      throw new HttpException(
        {
          message:
            err.message ||
            'Erro interno ao processar a criação e agendamento da IA.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
