import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { ErrorEntity } from 'src/entities/error.entity';
import { filterSolicitacaoDto } from './dto/filter-solicitacao.dto';
import { Sequelize } from 'src/sequelize/sequelize';
import { PrismaService } from '../../prisma/prisma.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import { SmsService } from '../../sms/sms.service';
import { UserPayload } from 'src/auth/entities/user.entity';
import { LogService } from '../../log/log.service';
import { SolicitacaoEntity } from './entities/solicitacao.entity';
import { SolicitacaoAllEntity } from './entities/solicitacao.propety.entity';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { ErrorService } from 'src/error/error.service';
import { FcwebEntity } from './entities/fcweb.entity';
import { UpdateFcwebDto } from './dto/update-fcweb.dto';
import { Logs } from './entities/logs.entity';

@Injectable()
export class SolicitacaoService {
  private isSequelizeAvailable = true;

  constructor(
    private prisma: PrismaService,
    private fcwebProvider: FcwebProvider,
    private sms: SmsService,
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
      const exist = await this.prisma.read.solicitacao.findFirst({
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
          await this.prisma.write.chamado.create({
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

      const Cliente = await this.prisma.write.solicitacao.create({
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

      const retorno = await this.prisma.read.solicitacao.findUnique({
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

      // const construtor = retorno.construtora.fantasia;
      // const financeira = retorno.financeiro.fantasia;
      // const empreendimento = retorno.empreendimento.cidade;
      // const Msg = helloMsg(data.nome, construtor, empreendimento, financeira);
      // const termo = Termos();

      // if (data.telefone && sms === 1) {
      //   const send = await this.sms.sendSms(Msg, data.telefone);
      //   if (send.status === 200) {
      //     await this.sms.sendSms(termo, data.telefone);
      //   }
      // }
      // if (data.telefone2 && sms === 1) {
      //   const send = await this.sms.sendSms(Msg, data.telefone2);
      //   if (send.status === 200) {
      //     await this.sms.sendSms(termo, data.telefone2);
      //   }
      // }
      await this.Log.Post({
        User: user.id,
        EffectId: retorno.id,
        Rota: 'solicitacao',
        Descricao: `Solicitação criada por ${user.id}-${user.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

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
          corretor: UserData.id,
          ativo: true,
          distrato: false,
        }),
        ...(UserData?.hierarquia === 'CONST' && {
          construtora: {
            id: {
              in: ConstId,
            },
          },
          ativo: true,
          distrato: false,
        }),
        ...(UserData?.hierarquia === 'EMP' && {
          empreendimento: {
            id: {
              in: EmpId,
            },
          },
          ativo: true,
          distrato: false,
        }),
        ...(UserData?.hierarquia === 'CCA' && {
          financeiro: {
            id: {
              in: Ids,
            },
          },
          empreendimento: {
            id: {
              in: EmpId,
            },
          },
          construtora: {
            id: {
              in: ConstId,
            },
          },
          ativo: true,
          distrato: false,
        }),
        ...(UserData?.hierarquia === 'ADM' &&
          {
            // ativo: true,
            // distrato: false,
          }),
        ...(UserData?.hierarquia === 'GRT' && {
          construtora: {
            id: {
              in: ConstId,
            },
          },
          empreendimento: {
            id: {
              in: EmpId,
            },
          },
          financeiro: {
            id: {
              in: Ids,
            },
          },
          ativo: true,
          distrato: false,
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
          construtora: {
            id: +construtora,
          },
        }),
        ...(empreendimento && {
          empreendimento: {
            id: +empreendimento,
          },
        }),
        ...(financeiro && {
          financeiro: {
            id: +financeiro,
          },
        }),
      };

      const count = await this.prisma.read.solicitacao.count({
        where: FilterWhere,
      });

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

      let req = await this.prisma.read.solicitacao.findMany({
        where: FilterWhere,
        orderBy: { createdAt: 'desc' },
        select,
        skip: Offset,
        take: Limite,
      });

      // Create a deep copy of the req array to avoid reference issues
      const updatedReq = JSON.parse(JSON.stringify(req));

      // Process all Fcweb updates
      const updatePromises = updatedReq.map(
        async (item: any, index: string | number) => {
          if (item.andamento !== 'EMITIDO') {
            try {
              const ficha = item.id_fcw
                ? await this.GetFcweb(item.id_fcw)
                : await this.GetFcwebExist(item.cpf);

              if (ficha && ficha.andamento) {
                // Helper function to safely parse time values

                // Update the database
                await this.prisma.write.solicitacao.update({
                  where: { id: item.id },
                  data: {
                    andamento: ficha.andamento,
                    dt_agendamento: this.formatDateString(ficha.dt_agenda),
                    hr_agendamento: this.formatTimeString(ficha.hr_agenda),
                    dt_aprovacao: this.formatDateString(ficha.dt_aprovacao),
                    hr_aprovacao: this.formatTimeString(ficha.hr_aprovacao),
                  },
                });
                // Update our local copy
                updatedReq[index] = {
                  ...item,
                  andamento: ficha.andamento,
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
        },
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      // Return the updated data
      return plainToClass(SolicitacaoAllEntity, {
        total: count,
        data: updatedReq,
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

      const req = await this.prisma.read.solicitacao.findFirst({
        where: {
          id: id,
          ...(user.hierarquia === 'USER' && {
            financeiroId: { in: IdsFineceiros },
            OR: [{ corretorId: user.id }, { corretorId: null }],
          }),
          ...(user.hierarquia === 'CONST' && {
            financeiroId: { in: IdsFineceiros },
          }),
          ...(user.hierarquia === 'GRT' && {
            financeiroId: { in: IdsFineceiros },
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
      const ficha = req.id_fcw
        ? await this.GetFcweb(req.id_fcw)
        : await this.GetFcwebExist(req.cpf);

      if (ficha && ficha.andamento) {
        // Helper function to safely parse time values

        // Update the database
        await this.prisma.write.solicitacao.update({
          where: { id: req.id },
          data: {
            ...(!req.id_fcw && { id_fcw: ficha.id }),
            nome: ficha.nome,
            andamento: ficha.andamento,
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
      throw new HttpException(retorno, 400);
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
      // Exclui os campos de chave estrangeira (corretorId, financeiroId, etc.) do spread
      // para evitar conflito entre 'connect' e atribuição direta de IDs no Prisma.
      const { corretor, financeiro, construtora, empreendimento, corretorId, financeiroId, construtoraId, empreendimentoId, ...rest } = data;
      // await this.prisma.solicitacao.findMany({
      //   where: {
      //     cpf: {
      //       in: relacionamentos,
      //     },
      //   },
      // });
      const desconectarData: any = {};

      if (data.financeiro) {
        desconectarData.financeiro = { disconnect: true };
      }
      if (data.construtora) {
        desconectarData.construtora = { disconnect: true };
      }
      if (data.empreendimento) {
        desconectarData.empreendimento = { disconnect: true };
      }
      if (data.corretor) {
        desconectarData.corretor = { disconnect: true };
      }

      if (Object.keys(desconectarData).length > 0) {
        await this.prisma.write.solicitacao.update({
          where: { id },
          data: desconectarData,
        });
      }

      await this.prisma.write.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          ...rest,

          ...(data.uploadCnh && {
            uploadCnh: data.uploadCnh ? { ...data.uploadCnh } : undefined,
          }),
          ...(data.uploadRg && {
            uploadRg: data.uploadRg ? { ...data.uploadRg } : undefined,
          }),
          ...(data.corretor && {
            corretor:
              user.hierarquia === 'ADM'
                ? { connect: { id: data.corretor } }
                : { connect: { id: user.id } },
          }),
          ...(data.financeiro && {
            financeiro: { connect: { id: data.financeiro } },
          }),
          ...(data.construtora && {
            construtora: { connect: { id: data.construtora } },
          }),
          ...(data.empreendimento && {
            empreendimento: { connect: { id: data.empreendimento } },
          }),
        },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} atualizou a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      const req = await this.prisma.read.solicitacao.findFirst({
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
      await this.prisma.write.solicitacao.update({
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
      await this.prisma.write.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          distrato: true,
          dt_distrato: new Date(),
          distrato_id: user.id,
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
      const get = await this.prisma.read.solicitacao.findUnique({
        where: {
          id: id,
        },
      });
      await this.prisma.write.solicitacao.update({
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
      const consulta = await this.prisma.read.solicitacao.findFirst({
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
      let mensagem: string;

      if (consulta.construtora.Msg_Boas_Vindas === null) {
        mensagem = `Ola ${consulta.nome}, tudo bem?!\n\nSomos a Interface Certificadora, e à pedido da construtora ${consulta.construtora.fantasia} estamos entrando em contato referente ao seu novo empreendimento, em ${consulta.empreendimento.cidade}.\nPrecisamos fazer o seu certificado digital para que você possa assinar os documentos do seu financiamento imobiliário junto a CAIXA e Correspondente bancário ${consulta.financeiro.fantasia}, e assim prosseguir para a próxima etapa.\n\nPara mais informações, responda essa mensagem, ou aguarde segundo contato.`;
      } else {
        const template = consulta.construtora.Msg_Boas_Vindas;
        mensagem = template
          .replace('{nome}', consulta.nome)
          .replace('{construtora}', consulta.construtora.fantasia)
          .replace('{cidade}', consulta.empreendimento.cidade);
      }
      const { msg } = await this.sms.sendSms(mensagem, consulta.telefone);
      return this.sms.sendmensagem(mensagem, consulta.telefone);
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
   * @returns {Promise<{message: string}>} - A message indicating successful reactivation.
   * @throws {HttpException} - If the solicitacao is already active or another error occurs.
   */

  async updateAtivo(id: number, user: any): Promise<{ message: string }> {
    try {
      const req = await this.prisma.read.solicitacao.findFirst({
        where: { id },
        select: { ativo: true },
      });
      if (req.ativo) throw new Error('Solicitação ja Ativa');

      await this.prisma.write.solicitacao.update({
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
      const status = await this.prisma.read.solicitacao.findUnique({
        where: { id },
        select: { statusAtendimento: true },
      });

      await this.prisma.write.solicitacao.update({
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
            const verifique = await this.prisma.read.tag.findFirst({
              where: {
                descricao: tag.label,
                solicitacao: data.solicitacao,
              },
            });
            const filtro = verifique ? false : true;
            if (filtro) {
              await this.prisma.write.tag.create({
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
      const solicitacaoAtualizada = await this.prisma.write.solicitacao.update({
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
  async GetFcwebExist(cpf: string): Promise<{id: number, andamento: string, dt_agenda: Date, hr_agenda: string, dt_aprovacao: Date, hr_aprovacao: string, nome: string;} | null> {
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
      const solicitacaoAtualizada = await this.prisma.write.solicitacao.update({
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
      const req = await this.prisma.read.solicitacao.findUnique({
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
      const req = await this.prisma.read.solicitacao.count({
        where: {
          ativo: true,
          alertanow: true,
          distrato: false,
          direto: false,
          andamento: null,
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

  async listNowGet(): Promise<SolicitacaoAllEntity> {
    try {
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

      const req = await this.prisma.read.solicitacao.findMany({
        where: {
          ativo: true,
          alertanow: true,
          distrato: false,
          direto: false,
          andamento: null,
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
      return plainToClass(SolicitacaoAllEntity, {
        total: req.length,
        data: req,
        pagina: 1,
        limite: req.length,
      });
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
      const req = await this.prisma.write.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          obs: obs,
        },
      });
      if (!req) {
        const retorno: ErrorEntity = {
          message: 'Solicitacao nao encontrada',
        };
        throw new HttpException(retorno, 400);
      }
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} enviou um chat para a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
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
      const req = await this.prisma.read.logs.findMany({
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
