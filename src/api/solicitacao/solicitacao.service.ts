import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UserPayload } from 'src/auth/entities/user.entity';
import { ErrorEntity } from 'src/entities/error.entity';
import { ErrorService } from 'src/error/error.service';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { Sequelize } from 'src/sequelize/sequelize';
import { LogService } from '../../log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { filterSolicitacaoDto } from './dto/filter-solicitacao.dto';
import { UpdateFcwebDto } from './dto/update-fcweb.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { FcwebEntity } from './entities/fcweb.entity';
import { Logs } from './entities/logs.entity';
import { SolicitacaoEntity } from './entities/solicitacao.entity';
import { SolicitacaoAllEntity } from './entities/solicitacao.propety.entity';

@Injectable()
export class SolicitacaoService {
  private isSequelizeAvailable = true;

  constructor(
    private prisma: PrismaService,
    private fcwebProvider: FcwebProvider,
    private smsService: SmsService,
    private Log: LogService,
    private LogError: ErrorService,
    private sequelize: Sequelize,
  ) {
    this.initializeSequelizeCheck();
  }

  /**
   * Verifica periodicamente a disponibilidade do Sequelize
   */
  private async initializeSequelizeCheck() {
    // Verifica a cada 5 minutos se o Sequelize está disponível
    setInterval(
      async () => {
        try {
          const isConnected = this.sequelize.isDatabaseConnected();
          if (this.isSequelizeAvailable !== isConnected) {
            this.logger.log(
              `Status do Sequelize alterado para: ${isConnected ? 'Disponível' : 'Indisponível'}`,
            );
            this.isSequelizeAvailable = isConnected;
          }
        } catch (error) {
          this.isSequelizeAvailable = false;
          this.logger.error('Erro ao verificar status do Sequelize:', error);
        }
      },
      5 * 60 * 1000,
    ); // 5 minutos
  }

  /**
   * Executa uma operação segura com o Sequelize
   * Retorna null em caso de falha e registra o erro
   */
  private async safeSequelizeOperation<T>(
    operation: () => Promise<T>,
    context: string = 'Operação com Sequelize',
    defaultValue: any = null,
  ): Promise<T | null> {
    if (!this.isSequelizeAvailable) {
      this.logger.warn(`${context} ignorada: Sequelize está indisponível`);
      return defaultValue;
    }

    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Erro ao executar ${context}:`, error);

      // Se for um erro de conexão, marca o Sequelize como indisponível temporariamente
      if (
        error.name === 'SequelizeConnectionError' ||
        error.name === 'SequelizeConnectionRefusedError'
      ) {
        this.isSequelizeAvailable = false;
        this.logger.warn('Sequelize marcado como indisponível temporariamente');

        // Tenta reconectar após 1 minuto
        setTimeout(() => {
          this.isSequelizeAvailable = true;
          this.logger.log('Tentando reconectar ao Sequelize...');
        }, 60000);
      }

      return defaultValue;
    }
  }
  // private readonly Queue = 'sms';
  // private readonly Messager = new RabbitnqService(this.Queue);
  private readonly logger = new Logger(SolicitacaoService.name, {
    timestamp: true,
  });

  /**
   * Create a new solicitacao.
   * @param {CreateSolicitacaoDto} data - The data to create the solicitacao.
   * @param {string} sms - The SMS message to be sent.
   * @param {anUserPayload} user - The user who is creating the solicitacao.
   * @returns {Promise<SolicitacaoEntity>} - The created solicitacao.
   */
  async create(data: CreateSolicitacaoDto, sms: number, user: UserPayload) {
    try {
      const { uploadCnh, uploadRg, url, ...rest } = data;
      // const last = await this.prisma.solicitacao.findFirst({
      //   orderBy: { id: 'desc' },
      //   select: { id: true },
      // });
      // const nextId = (last?.id ?? 0) + 1;
      const exist = await this.prisma.solicitacao.findFirst({
        where: {
          cpf: data.cpf,
          andamento: {
            notIn: ['APROVADO', 'EMITIDO', 'REVOGADO'],
          },
        },
        include: {
          corretor: true,
          financeiro: true,
          construtora: true,
          empreendimento: true,
        },
      });

      if (exist) {
        const empredimentoOk = user.empreendimento.find(
          (e: any) => e.id === exist.empreendimentoId,
        );
        if (!empredimentoOk) {
          await this.prisma.chamado.create({
            data: {
              titulo: 'Solicitação de Importação de Cliente Existente',
              idUser: user.id,
              solicitacaoId: exist.id,
              status: 'ABERTO',
              descricao: `Usuário ${user.id} - ${user.nome} tentou cadastrar um cliente que já existe, porem o usuário nao tem acesso, verificar possibilidade de importação desse cliente ${exist.id}-${exist.nome} para o usuário`,
            },
          });
          await this.Log.Post({
            User: user.id,
            EffectId: exist.id,
            Rota: 'solicitacao',
            Descricao: `Usuario ${user.id}-${user.nome} solicitou importação de cliente ${exist.id}-${exist.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
          });

          throw new HttpException(
            {
              message:
                'ATENÇÃO.\n1 - Cliente já cadastrado em nosso sistema, vinculado a outro solicitante.\n\n2- Um chamado para remanejamento já foi aberto para você.\n\n3 - Em breve ele será ativado para você. ou o seu gestor de conta do sisnato irá entrar em contato para maiores esclarecimentos.\n\n4 -Mas caso queira, chame seu agente comercial no whatsapp (16) 9 9270-8316',
            },
            400,
          );
        } else {
          return { redirect: true, url: `${data.url}/solicitacao/${exist.id}` };
        }
      }

      const Cliente = await this.prisma.solicitacao.create({
        data: {
          ...rest,
          ...(uploadCnh && { uploadCnh: JSON.stringify(uploadCnh) }),
          ...(uploadRg && { uploadRg: JSON.stringify(uploadRg) }),
          ativo: true,
          corretor: { connect: { id: data.corretor } },
          financeiro: { connect: { id: data.financeiro } },
          construtora: { connect: { id: data.construtora } },
          empreendimento: { connect: { id: data.empreendimento } },
        },
      });

      const retorno = await this.prisma.solicitacao.findUnique({
        where: {
          id: Cliente.id,
        },
        include: {
          corretor: true,
          financeiro: true,
          construtora: true,
          empreendimento: true,
        },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: retorno.id,
        Rota: 'solicitacao',
        Descricao: `Solicitação criada por ${user.id}-${user.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      if (sms) {
        await this.smsService.cerateChat(retorno.telefone, retorno.nome, retorno.construtora.fantasia, retorno.empreendimento.cidade, retorno.financeiro.fantasia);
      }

      return retorno;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao criar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Recupera uma lista de solicita es de acordo com os filtros e
   *   paginacao informados.
   * @param {number} pagina - O n mero da pagina a ser recuperada.
   * @param {number} limite - O n mero de solicita es por pagina.
   * @param {filterSolicitacaoDto} filtro - O filtro para a solicita o.
   * @param {any} UserData - Os dados do usu rio logado.
   * @returns {Promise<SolicitacaoAllEntity>} - A lista de solicita es.
   */
  async findAll(
    pagina: number,
    limite: number,
    filtro: filterSolicitacaoDto,
    UserData: any,
  ): Promise<SolicitacaoAllEntity> {
    try {
      const { nome, id, andamento, construtora, empreendimento, financeiro } =
        filtro;
      const PaginaAtual = pagina || 1;
      const Limite = !!andamento ? 50 : limite ? limite : 20;
      const Offset = (PaginaAtual - 1) * Limite;
      const Ids = UserData?.Financeira || [];
      const ConstId = UserData?.construtora || [];
      const EmpId = UserData?.empreendimento || [];

      const FilterWhere = {
        direto: false,
        ...(UserData?.hierarquia === 'USER' && {
          financeiroId: { in: Ids },
          construtoraId: { in: ConstId },
          empreendimentoId: { in: EmpId },
          corretorId: UserData.id,
          ativo: true,
          distrato: false,
        }),
        ...(UserData?.hierarquia === 'CONST' && {
          construtoraId: { in: ConstId },
          ativo: true,
          distrato: false,
        }),
        ...(UserData?.hierarquia === 'CCA' && {
          ...(ConstId && {
            construtoraId: { in: ConstId },
          }),
          financeiroId: { in: Ids },
        }),
        ...(UserData?.hierarquia === 'ADM' &&
        {
          // ativo: true,
          // distrato: false,
        }),
        ...(UserData?.hierarquia === 'GRT' && {
          empreendimentoId: { in: EmpId },
        }),
        ...(nome && {
          nome: {
            contains: nome,
          },
        }),
        ...(id && {
          id: +id,
        }),
        ...(andamento && {
          andamento: andamento === 'VAZIO' ? null : andamento,
        }),
        ...(construtora && {
          construtoraId: +construtora,
        }),
        ...(empreendimento && {
          empreendimentoId: +empreendimento,
        }),
        ...(financeiro && {
          financeiroId: +financeiro,
        }),
      };

      const select = {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        andamento: true,
        alerts: true,
        distrato: true,
        dt_agendamento: true,
        hr_agendamento: true,
        dt_aprovacao: true,
        hr_aprovacao: true,
        type_validacao: true,
        alertanow: true,
        gov: true,
        corretor: {
          select: {
            id: true,
            nome: true,
          },
        },
        construtora: {
          select: {
            id: true,
            fantasia: true,
          },
        },
        empreendimento: {
          select: {
            id: true,
            nome: true,
            cidade: true,
          },
        },
        financeiro: {
          select: {
            id: true,
            fantasia: true,
          },
        },
        id_fcw: true,
        statusAtendimento: true,
        ativo: true,
        pause: true,
        tags: true,
        createdAt: true,
      };

      let req = await this.prisma.solicitacao.findMany({
        where: FilterWhere,
        orderBy: { createdAt: 'desc' },
        select,
        skip: Offset,
        take: Limite,
      });

      // Create a deep copy of the req array to avoid reference issues
      const updatedReq = JSON.parse(JSON.stringify(req));

      // Processa atualizações ao Fcweb com limitação de concorrência
      // para evitar sobrecarga do banco e estouro de conexões.
      const batchSize = 5; // ajuste fino conforme capacidade do banco
      for (let start = 0; start < updatedReq.length; start += batchSize) {
        const slice = updatedReq.slice(start, start + batchSize);
        await Promise.all(
          slice.map(async (item: any, idx: number) => {
            if (item.andamento !== 'EMITIDO') {
              try {
                const ficha = item.id_fcw
                  ? await this.GetFcweb(item.id_fcw)
                  : await this.GetFcwebExist(item.cpf);

                if (ficha && ficha.andamento) {
                  // Atualiza no banco (cliente de escrita)
                  await this.prisma.solicitacao.update({
                    where: { id: item.id },
                    data: {
                      ...(ficha.andamento === 'APROVADO' && { gov: false }),
                      ...(ficha.andamento === 'EMITIDO' && { gov: false }),
                      andamento: ficha.andamento,
                      type_validacao: ficha.validacao,
                      dt_agendamento: this.formatDateString(ficha.dt_agenda),
                      hr_agendamento: this.formatTimeString(ficha.hr_agenda),
                      dt_aprovacao: this.formatDateString(ficha.dt_aprovacao),
                      hr_aprovacao: this.formatTimeString(ficha.hr_aprovacao),
                    },
                  });

                  // Atualiza cópia local (usa o índice real calculado)
                  const realIndex = start + idx;
                  updatedReq[realIndex] = {
                    ...item,
                    ...(ficha.andamento === 'APROVADO' && { gov: false }),
                    ...(ficha.andamento === 'EMITIDO' && { gov: false }),
                    andamento: ficha.andamento,
                    type_validacao: ficha.validacao,
                    dt_agendamento: this.formatDateString(ficha.dt_agenda),
                    hr_agendamento: this.formatTimeString(ficha.hr_agenda),
                    dt_aprovacao: this.formatDateString(ficha.dt_aprovacao),
                    hr_aprovacao: this.formatTimeString(ficha.hr_aprovacao),
                  };
                }
              } catch (error) {
                this.LogError.Post(JSON.stringify(error, null, 2));
                console.error(`Error updating item ${item.id}:`, error);
              }
            }
            return item;
          }),
        );
      }

      // Usa mecanismo de retry/fallback do PrismaService para reduzir falhas transitórias
      const Cont2 = await this.prisma.solicitacao.count({
        where: FilterWhere,
      });

      const request = await this.prisma.solicitacao.findMany({
        where: FilterWhere,
        orderBy: { createdAt: 'desc' },
        select,
        skip: Offset,
        take: Limite,
      });
      // Return the updated data
      return plainToClass(SolicitacaoAllEntity, {
        total: Cont2,
        data: request,
        pagina: PaginaAtual,
        limite: Limite,
      });
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * @description Busca uma solicita o pelo seu ID.
   * @param {number} id - ID da solicita o.
   * @param {UserPayload} user - Usu rio que est  fazendo a consulta.
   * @returns {Promise<SolicitacaoEntity>} - Solicita o encontrada.
   */
  async findOne(id: number, user: UserPayload): Promise<SolicitacaoEntity> {
    try {
      const IdsFineceiros = user.Financeira;
      const ConstId = user.construtora;
      const EmpId = user.empreendimento;

      const req = await this.prisma.solicitacao.findFirst({
        where: {
          id: id,
          ...(user.hierarquia === 'USER' && {
            financeiroId: { in: IdsFineceiros },
            construtoraId: { in: ConstId },
            empreendimentoId: { in: EmpId },
            corretorId: user.id,
            ativo: true,
            distrato: false,
          }),
          ...(user.hierarquia === 'CONST' && {
            construtoraId: { in: ConstId },
          }),
          ...(user.hierarquia === 'GRT' && {
            empreendimentoId: { in: EmpId },
          }),
          ...(user.hierarquia === 'CCA' && {
            OR: [
              { corretorId: user.id },
              { corretorId: null },
              { financeiroId: { in: IdsFineceiros } },
              { financeiroId: null },
            ],
          }),
        },
        include: {
          corretor: {
            select: {
              id: true,
              nome: true,
              telefone: true,
            },
          },
          construtora: {
            select: {
              id: true,
              fantasia: true,
              valor_cert: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
              cidade: true,
              estado: true,
              tag: true,
            },
          },
          financeiro: {
            select: {
              id: true,
              fantasia: true,
              tel: true,
              valor_cert: true,
            },
          },
          alerts: {
            select: {
              id: true,
              descricao: true,
              status: true,
              createdAt: true,
            },
          },
          tags: true,
        },
      });
      if (!req) {
        throw new NotFoundException(
          'Solicitação não encontrada ou você não tem permissão para acessá-la',
          '404',
        );
      }

      const ficha = req.id_fcw
        ? await this.GetFcweb(req.id_fcw)
        : await this.GetFcwebExist(req.cpf);

      if (ficha && ficha.andamento) {
        // Helper function to safely parse time values

        // Update the database
        await this.prisma.solicitacao.update({
          where: { id: req.id },
          data: {
            ...(!req.id_fcw && { id_fcw: ficha.id }),
            nome: ficha.nome,
            ...(ficha.andamento === 'APROVADO' && { gov: false }),
            ...(ficha.andamento === 'EMITIDO' && { gov: false }),
            andamento: ficha.andamento,
            type_validacao: ficha.validacao,
            dt_agendamento: this.formatDateString(ficha.dt_agenda),
            hr_agendamento: this.formatTimeString(ficha.hr_agenda),
            dt_aprovacao: this.formatDateString(ficha.dt_aprovacao),
            hr_aprovacao: this.formatTimeString(ficha.hr_aprovacao),
          },
        });

        req.andamento = ficha.andamento;
        if (!req.id_fcw) {
          req.id_fcw = ficha.id;
        }
        req.nome = ficha.nome;
        req.gov =
          ficha.andamento === 'APROVADO' || ficha.andamento === 'EMITIDO'
            ? false
            : req.gov;
        req.type_validacao = ficha.validacao;
        req.dt_agendamento = this.formatDateString(ficha.dt_agenda);
        req.hr_agendamento = this.formatTimeString(ficha.hr_agenda);
        req.dt_aprovacao = this.formatDateString(ficha.dt_aprovacao);
        req.hr_aprovacao = this.formatTimeString(ficha.hr_aprovacao);
      }

      return plainToClass(SolicitacaoEntity, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, error.status);
    }
  }

  /**
   * Update a solicitacao.
   * @param {number} id - The id of the solicitacao.
   * @param {UpdateSolicitacaoDto} data - The data to update the solicitacao.
   * @param {UserPayload} user - The user who is updating the solicitacao.
   * @returns {Promise<SolicitacaoEntity>} - The updated solicitacao.
   */
  async update(
    id: number,
    data: UpdateSolicitacaoDto,
    user: UserPayload,
  ): Promise<SolicitacaoEntity> {
    try {
      const isADM = user.hierarquia === 'ADM';
      const {
        corretor,
        financeiro,
        construtora,
        empreendimento,
        id_fcw,
        ...rest
      } = data;

      const solicitacao = await this.prisma.solicitacao.findFirst({
        where: {
          id: id,
        },
        select: {
          id: true,
          corretorId: true,
          financeiroId: true,
          construtoraId: true,
          empreendimentoId: true,
          id_fcw: true,
        },
      });

      const updateData = await this.prisma.solicitacao.update({
        where: {
          id: id,
        },

        data: {
          ...rest,
          ...(corretor && isADM && { corretorId: +corretor }),
          ...(construtora &&
            financeiro &&
            empreendimento &&
            !solicitacao.corretorId &&
            !isADM && { corretorId: +user.id }),
          ...(solicitacao.financeiroId !== financeiro && {
            financeiroId: +financeiro,
          }),
          ...(solicitacao.construtoraId !== construtora && {
            construtoraId: +construtora,
          }),
          ...(solicitacao.empreendimentoId !== empreendimento && {
            empreendimentoId: +empreendimento,
          }),
        },
        include: {
          corretor: true,
          construtora: true,
          empreendimento: true,
          financeiro: true,
          alerts: true,
          tags: true,
        },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} atualizou a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      this.logger.log(
        `Solicitacao ${id} atualizada com sucesso - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      );

      return plainToClass(SolicitacaoEntity, updateData);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao atualizar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async LimparFcweb(
    id: number,
    data: any,
    user: any,
  ): Promise<SolicitacaoEntity> {
    try {
      const solicitacao = await this.prisma.solicitacao.findFirst({
        where: {
          id: id,
        },
        select: {
          id: true,
          id_fcw: true,
        },
      });

      await this.fcwebProvider.updateFcweb(solicitacao.id_fcw, {
        contador: '',
      });

      const updateData = await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          id_fcw: null,
          andamento: null,
          hr_agendamento: null,
          dt_agendamento: null,
          type_validacao: null,
        },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} atualizou a Solicitacao ${id} removendo o relacionamento com o FCWEB ${solicitacao.id_fcw} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      this.logger.log(
        `Solicitacao ${id} atualizada com sucesso - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      );

      return plainToClass(SolicitacaoEntity, updateData);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao atualizar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async updateSisapp(
    id: number,
    data: UpdateSolicitacaoDto,
    user: any,
  ): Promise<SolicitacaoEntity> {
    try {
      const updateData = await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          sisapp: data.sisapp,
        },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} enviou o cliente ${id} - ${updateData.nome} para o atendimento via aplicativo - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(SolicitacaoEntity, updateData);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao atualizar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Desativa uma solicitacao pelo seu ID.
   * @param id ID da solicitacao a ser desativada.
   * @param user Usu rio que esta desativando a solicitacao.
   * @returns {Promise<{ message: string }>} JSON com uma mensagem de sucesso.
   * @throws HttpException Caso a solicitacao nao seja encontrada.
   */
  async remove(id: number, user: any): Promise<{ message: string }> {
    try {
      await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          ativo: false,
        },
      });
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} desativou a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return { message: 'Solicitacao excluida com sucesso' };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao deletar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async distrato(id: number, user: any): Promise<{ message: string }> {
    try {
      await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          distrato: true,
          dt_distrato: new Date(),
          distrato_id: user.id,
          dt_agendamento: null,
          hr_agendamento: null,
          type_validacao: null,
          andamento: null,
          id_fcw: null,
        },
      });
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} solicitou o distrato para a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return { message: 'Distrato realizado com sucesso' };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro no distrato da solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async novo_acordo(id: number, user: any) {
    try {
      const get = await this.prisma.solicitacao.findUnique({
        where: {
          id: id,
        },
      });
      await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          distrato: false,
          dt_distrato: null,
          distrato_id: null,
          obs: [
            ...get.obs,
            {
              autor: 'Sistema',
              autor_id: 999,
              data: new Date()
                .toISOString()
                .split('T')[0]
                .split('-')
                .reverse()
                .join('/'),
              hora: new Date().toISOString().split('T')[1].split('.')[0],
              id: new Date().getTime().toString(),
              mensagem: 'Novo acordo firmado',
            },
          ],
        },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} solicitou o novo acordo para a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return { message: 'Novo acordo realizado com sucesso' };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro no novo acordo da solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Reenvia o SMS para o cliente com o ID informado.
   * @param id - ID da Solicita o
   * @param user - Usu rio que esta reenviando o SMS
   * @returns {Promise<{message: string}>} - Retorna um objeto com a mensagem de sucesso.
   */
  async sendSms(id: number, user: UserPayload) {
    try {
      const consulta = await this.prisma.solicitacao.findFirst({
        where: {
          id: id,
        },
        select: {
          nome: true,
          telefone: true,
          construtora: {
            select: {
              fantasia: true,
              Msg_Boas_Vindas: true,
            },
          },
          empreendimento: {
            select: {
              cidade: true,
            },
          },
          financeiro: {
            select: {
              fantasia: true,
            },
          },
        },
      });

      return await this.smsService.sendSmS(consulta.telefone, consulta.nome);
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      throw error;
    }
  }

  /**
   * Reactivates a solicitacao by setting its 'ativo' status to true.
   * Logs the reactivation event.
   *
   * @param {number} id - The ID of the solicitacao to reactivate.
   * @param {any} user - The user performing the reactivation.
   * @returns {Promise<{ message: string }>} - A message indicating successful reactivation.
   * @throws {HttpException} - If the solicitacao is already active or another error occurs.
   */

  async updateAtivo(id: number, user: any): Promise<{ message: string }> {
    try {
      const req = await this.prisma.solicitacao.findFirst({
        where: { id },
        select: { ativo: true },
      });
      if (req.ativo) throw new Error('Solicitação ja Ativa');

      await this.prisma.solicitacao.update({
        where: { id },
        data: { ativo: true },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} reativou a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return { message: 'Solicitação Reativada com sucesso' };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao reativar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: 'Não foi possível reativar a Solicitacao! ' + error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Toggle the 'statusAtendimento' flag of a solicitacao.
   * If the flag is true, sets it to false, and vice versa.
   * Logs the atendimento event.
   *
   * @param {number} id - The ID of the solicitacao to be toggled.
   * @param {any} user - The user performing the toggle.
   * @returns {Promise<boolean>} - The new value of the flag.
   * @throws {HttpException} - If an error occurs during the toggling process.
   */
  async Atendimento(id: number, user: any): Promise<boolean> {
    try {
      const status = await this.prisma.solicitacao.findUnique({
        where: { id },
        select: { statusAtendimento: true },
      });

      await this.prisma.solicitacao.update({
        where: { id },
        data: { statusAtendimento: !status.statusAtendimento },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} ${status.statusAtendimento ? 'cancelou o atendimento' : 'iniciou o atendimento'} para Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return !status.statusAtendimento;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao atender solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Cria uma nova tag para a solicitacao informada.
   * Somente usuários com hierarquia 'ADM' podem criar tags.
   * @param {object} data - Um objeto com a chave 'solicitacao' e 'tags'.
   * @param {any} user - O usuários que está criando a tag.
   * @returns {Promise<{message: string}>} - Uma promise que resolve com um objeto contendo a mensagem de sucesso.
   * @throws {HttpException} - Se ocorrer um erro durante a criação da tag.
   */
  async PostTags(data: any, user: any): Promise<{ message: string }> {
    try {
      const tags = data.tags;

      if (data) {
        for (let i = 0; i < tags.length; i++) {
          const tag = tags[i];
          if (tag.label && user.hierarquia === 'ADM') {
            const verifique = await this.prisma.tag.findFirst({
              where: {
                descricao: tag.label,
                solicitacao: data.solicitacao,
              },
            });
            const filtro = verifique ? false : true;
            if (filtro) {
              await this.prisma.tag.create({
                data: {
                  descricao: tag.label,
                  solicitacao: data.solicitacao,
                },
              });
            }
          }
        }
        await this.Log.Post({
          User: user.id,
          EffectId: data.solicitacao,
          Rota: 'solicitacao',
          Descricao: `O Usuário ${user.id}-${user.nome} adicionou tag para Solicitacao ${data.solicitacao} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
        });
      }
      return { message: 'tag adicionada com susseso' };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao adicionar tag:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Alterna o status de pausa de uma solicitação.
   * Se estiver pausada, retoma; se estiver ativa, pausa.
   * Registra o evento de pausa/retomada no log.
   *
   * @param {any} body - Objeto contendo a flag 'pause' e outros dados opcionais.
   * @param {number} id - ID da solicitação a ser alterada.
   * @param {any} user - Usuário que está realizando a ação.
   * @returns {Promise<SolicitacaoEntity>} - A solicitação atualizada.
   * @throws {HttpException} - Se ocorrer um erro durante o processo.
   */
  async pause(body: any, id: number, user: any): Promise<SolicitacaoEntity> {
    try {
      // Registra a ação no log
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} ${body.pause ? 'pausou' : 'retomou'} a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      // Extrai a flag 'reativar' e mantém o resto do body
      const { reativar, ...rest } = body;

      // Atualiza a solicitação no banco de dados
      const solicitacaoAtualizada = await this.prisma.solicitacao.update({
        where: { id },
        data: {
          ...rest,
          ...(reativar && { createdAt: new Date() }), // Atualiza a data de criação se for um reativar
          statusAtendimento: !body.pause, // Inverte o status atual
        },
        include: {
          corretor: true,
          construtora: true,
          empreendimento: true,
          financeiro: true,
          alerts: true,
          tags: true,
        },
      });

      return plainToClass(SolicitacaoEntity, solicitacaoAtualizada);
    } catch (error) {
      // Log do erro detalhado
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao pausar/retomar solicitação:',
        JSON.stringify(error, null, 2),
      );

      // Retorna um erro formatado
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Busca um registro do Fcweb pelo ID
   * @param id - ID do registro
   * @returns {Promise<{id: number, andamento: string, dt_agenda: Date, hr_agenda: string, dt_aprovacao: Date, hr_aprovacao: string, nome?: string;} | null>}
   */
  async GetFcweb(id: number): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
    validacao: string;
    nome: string;
  } | null> {
    try {
      const fcweb = await this.fcwebProvider.findByIdMin(id);
      if (!fcweb) {
        this.logger.warn(`Registro Fcweb com ID ${id} não encontrado`);
        return null;
      }
      return fcweb;
    } catch (error) {
      this.logger.error(`Erro ao buscar Fcweb com ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Busca um registro do Fcweb pelo CPF
   * @param cpf - CPF do cliente
   * @returns Promise com o registro ou null se não encontrado
   */
  async GetFcwebExist(cpf: string): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
    validacao: string;
    nome: string;
  } | null> {
    if (!cpf) {
      this.logger.warn('CPF não fornecido para busca no Fcweb');
      return null;
    }
    try {
      const fcweb = await this.fcwebProvider.findByCpf(cpf);
      if (!fcweb) {
        this.logger.debug(`Nenhum registro encontrado para o CPF: ${cpf}`);
        return null;
      }
      return fcweb;
    } catch (error) {
      this.logger.error(`Erro ao buscar Fcweb com CPF ${cpf}:`, error);
      return null;
    }
  }

  async updateFcweb(id: number, data: any) {
    try {
      const update = await this.fcwebProvider.updateFcweb(id, data);
      return update;
    } catch (error) {
      this.logger.error(`Erro ao atualizar Fcweb com ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Atualiza um registro do Fcweb pelo seu ID.
   * @param {number} id - ID do registro do Fcweb.
   * @param {UpdateFcwebDto} data - Dados para atualização.
   * @param {UserPayload} user - Usuário que está realizando a atualização.
   * @returns {Promise<FcwebEntity>} - Registro do Fcweb atualizado.
   */
  async GetFcwebAtt(
    id: number,
    data: UpdateFcwebDto,
    user: UserPayload,
  ): Promise<FcwebEntity | null> {
    try {
      // Atualiza a solicitação no banco de dados
      const solicitacaoAtualizada = await this.prisma.solicitacao.update({
        where: { id },
        data: { ...data },
      });

      // Registra a ação no log
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} criou um FiCha FCWEB para a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      // Busca os dados completos da ficha FCWEB
      const fichaFcweb = await this.fcwebProvider.findByIdMin(id);

      if (!fichaFcweb) {
        throw new Error('Ficha FCWEB não encontrada');
      }

      // Mapeia os dados para o formato FcwebEntity
      return {
        id: fichaFcweb.id,
        andamento: fichaFcweb.andamento || '',
        dt_agenda: fichaFcweb.dt_agenda,
        hr_agenda: fichaFcweb.hr_agenda,
        dt_aprovacao: fichaFcweb.dt_aprovacao,
        hr_aprovacao: fichaFcweb.hr_aprovacao,
      };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar fcweb:',
        JSON.stringify(error, null, 2),
      );
      return null;
    }
  }

  async GetSolicitacaoById(id: number): Promise<SolicitacaoEntity> {
    try {
      const req = await this.prisma.solicitacao.findUnique({
        where: {
          id: id,
        },
        include: {
          corretor: true,
          construtora: true,
          empreendimento: true,
          financeiro: true,
          alerts: true,
          tags: true,
        },
      });
      return plainToClass(SolicitacaoEntity, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async listNowConst(): Promise<number> {
    try {
      const req = await this.prisma.solicitacao.count({
        where: {
          ativo: true,
          alertanow: true,
          distrato: false,
          direto: false,
          OR: [
            {
              andamento: null,
            },
            {
              andamento: {
                notIn: ['APROVADO', 'EMITIDO', 'REVOGADO'],
              },
            },
          ],
        },
      });

      return req;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao contar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async listNowGet() {
    try {
      const select = {
        id: true,
        nome: true,
        dt_criacao_now: true,
        alertanow: true,
        corretor: {
          select: {
            id: true,
            nome: true,
          },
        },
      };

      const req = await this.prisma.solicitacao.findMany({
        where: {
          ativo: true,
          alertanow: true,
          distrato: false,
          direto: false,
          OR: [
            {
              andamento: null,
            },
            {
              andamento: {
                notIn: ['APROVADO', 'EMITIDO', 'REVOGADO'],
              },
            },
          ],
        },
        select,
      });
      return {
        total: req.length,
        data: req,
        pagina: 1,
        limite: req.length,
      };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar solicitacao listNowGet:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async chat(body: UpdateSolicitacaoDto, id: number, user: any) {
    try {
      const { obs } = body;
      const req = await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          obs: obs,
        },
        include: {
          corretor: true,
        },
      });
      if (!req) {
        const retorno: ErrorEntity = {
          message: 'Solicitacao nao encontrada',
        };
        throw new HttpException(retorno, 400);
      }
      let receptor =
        user.hierarquia === 'ADM'
          ? `${req.corretor.id} - ${req.corretor.nome}`
          : `Admin`;
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} enviou um chat para ${receptor} => ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return req;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao atualizar solicitacao: Chat',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async getLogs(id: number, user: any) {
    try {
      const req = await this.prisma.logs.findMany({
        where: {
          EffectId: id,
          rota: 'solicitacao',
        },
        select: {
          id: true,
          createAt: true,
          descricao: true,
          User: true,
        },
      });

      return plainToInstance(Logs, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar logs solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  formatTimeString(timeString: any) {
    if (!timeString) return null;
    // If it's already a valid Date object
    if (timeString instanceof Date && !isNaN(timeString.getTime())) {
      return timeString;
    }
    // Handle MySQL TIME format (HH:MM:SS)
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const today = new Date();
      const [hours, minutes, seconds] = timeString.split(':').map(Number);

      if (!isNaN(hours) && !isNaN(minutes) && (!seconds || !isNaN(seconds))) {
        today.setHours(hours, minutes, seconds || 0, 0);
        return today;
      }
    }
    return null;
  }

  // Helper function to safely parse date values
  formatDateString(dateString: any) {
    if (!dateString) return null;

    // Tratar data zero do MySQL ("0000-00-00") explicitamente
    if (typeof dateString === 'string' && /^0{4}-0{2}-0{2}$/.test(dateString)) {
      return null;
    }

    // If it's already a valid Date object
    if (dateString instanceof Date && !isNaN(dateString.getTime())) {
      return dateString;
    }

    // Try to parse the date string
    const parsedDate = new Date(dateString);

    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Data inválida recebida: ${dateString}`);
      return null;
    }

    return parsedDate;
  }
}
