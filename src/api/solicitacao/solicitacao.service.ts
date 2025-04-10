import { HttpException, Injectable } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { ErrorEntity } from 'src/entities/error.entity';
import { filterSolicitacaoDto } from './dto/filter-solicitacao.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { plainToClass } from 'class-transformer';
import helloMsg from './data/hello_msg';
import { SmsService } from '../../sms/sms.service';
import Termos from './data/termo';
import { UserPayload } from 'src/auth/entities/user.entity';
import { LogService } from '../../log/log.service';
import { SolicitacaoEntity } from './entities/solicitacao.entity';
import { SolicitacaoAllEntity } from './entities/solicitacao.propety.entity';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';

@Injectable()
export class SolicitacaoService {
  constructor(
    private prisma: PrismaService,
    private fcwebProvider: FcwebProvider,
    private sms: SmsService,
    private Log: LogService,
  ) {}

  /**
   * Create a new solicitacao.
   * @param {CreateSolicitacaoDto} data - The data to create the solicitacao.
   * @param {string} sms - The SMS message to be sent.
   * @param {anUserPayload} user - The user who is creating the solicitacao.
   * @returns {Promise<SolicitacaoEntity>} - The created solicitacao.
   */
  async create(
    data: CreateSolicitacaoDto,
    sms: number,
    user: UserPayload,
  ): Promise<SolicitacaoEntity | { redirect: boolean; url: string }> {
    try {
      const { relacionamentos, ...rest } = data;
      const exist = await this.prisma.solicitacao.findFirst({
        where: {
          cpf: data.cpf,
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
              idUser: user.id,
              solicitacaoId: exist.id,
              status: 1,
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
                'Esse cliente ja esta cadastrado, porem ele nao esta no seu empreendimento, um chamado de importação sera aberto, duvidas? entre em contato com o atendimento',
            },
            400,
          );
        } else {
          return { redirect: true, url: `${data.url}/solicitacao/${exist.id}` };
        }
      }

      const listRelacionamentos = await this.prisma.solicitacao.findMany({
        where: {
          cpf: {
            in: relacionamentos,
          },
        },
        select: {
          id: true,
          nome: true,
        },
      });

      const Cliente = await this.prisma.solicitacao.create({
        data: {
          ...rest,
          ativo: true,
          corretor: { connect: { id: user.id || 1 } },
          financeiro: { connect: { id: data.financeiro } },
          construtora: { connect: { id: data.construtora } },
          empreendimento: { connect: { id: data.empreendimento } },
          relacionamentos: listRelacionamentos,
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

      const construtor = retorno.construtora.fantasia;
      const financeira = retorno.financeiro.fantasia;
      const empreendimento = retorno.empreendimento.cidade;
      const Msg = helloMsg(data.nome, construtor, empreendimento, financeira);
      const termo = Termos();

      if (data.telefone && sms === 1) {
        const send = await this.sms.sendSms(Msg, data.telefone);
        if (send.status === 200) {
          await this.sms.sendSms(termo, data.telefone);
        }
      }
      if (data.telefone2 && sms === 1) {
        const send = await this.sms.sendSms(Msg, data.telefone2);
        if (send.status === 200) {
          await this.sms.sendSms(termo, data.telefone2);
        }
      }
      await this.Log.Post({
        User: user.id,
        EffectId: retorno.id,
        Rota: 'solicitacao',
        Descricao: `Solicitação criada por ${user.id}-${user.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(SolicitacaoEntity, retorno);
    } catch (error) {
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
      const Ids = UserData.Financeira;
      const ConstId = UserData.construtora;
      const EmpId = UserData.empreendimento;

      const FilterWhere = {
        ...(UserData.hierarquia === 'USER' && {
          corretor: UserData.id,
          ativo: true,
          distrato: false,
        }),
        ...(UserData.hierarquia === 'CONST' && {
          construtoras: { some: { id: { in: ConstId } } },
        }),
        ...(UserData.hierarquia === 'GRT' && {
          financeiros: { some: { id: { in: Ids } } },
          ativo: true,
          construtoras: { some: { id: { in: ConstId } } },
          empreendimentos: { some: { id: { in: EmpId } } },
        }),
        ...(UserData.hierarquia === 'CCA' && {
          financeiroId: { in: Ids },
          ativo: true,
          ...(ConstId.length > 0 && {
            construtoras: { some: { id: { in: ConstId } } },
          }),
          ...(EmpId.length > 0 && {
            empreendimentos: { some: { id: { in: EmpId } } },
          }),
        }),
        ...(nome && { nome: { contains: nome } }),
        ...(id && { id: id }),
        ...(construtora > 0 && {
          construtoras: { some: { id: construtora } },
        }),
        ...(empreendimento > 0 && {
          empreendimentos: { some: { id: empreendimento } },
        }),
        ...(financeiro && { financeiros: { some: { id: financeiro } } }),
        ...(andamento && {
          andamento: { equals: andamento === 'VAZIO' ? null : andamento },
        }),
      };

      const count = await this.prisma.solicitacao.count({
        where: FilterWhere,
      });

      const select ={
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
        id_fcw: true,
        statusAtendimento: true,
        ativo: true,
        pause: true,
        tags: true,
        createdAt: true,
      }

      const req = await this.prisma.solicitacao.findMany({
        where: FilterWhere,
        orderBy: { id: 'desc'},
        select,
        skip: Offset,
        take: Limite,
      });

      req.forEach(async (item: any) => {
        if (item.andamento !== 'EMITIDO') {
          const ficha = await this.GetFcweb(item.id_fcw);
          if (ficha) {
            await this.prisma.solicitacao.update({
              where: {
                id: item.id,
              },
              data: {
                andamento: ficha.andamento,
                dt_agendamento: ficha.dt_agenda || null,
                hr_agendamento: ficha.hr_agenda || null,
                dt_aprovacao: ficha.dt_aprovacao || null,
                hr_aprovacao: ficha.hr_aprovacao || null,
              },
            });
          }
        }
      });

      const DadosAtualizado = await this.prisma.solicitacao.findMany({
        where: FilterWhere,
        orderBy: { id: 'desc'},
        select,
        skip: Offset,
        take: Limite,
      });

      return plainToClass(SolicitacaoAllEntity, {
        total: count,
        data: DadosAtualizado,
        pagina: PaginaAtual,
        limite: Limite,
      });
    } catch (error) {
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

      const req = await this.prisma.solicitacao.findFirst({
        where: {
          id: id,
          ...(user.hierarquia === 'USER' && {
            ativo: true,
            financeiroId: { in: IdsFineceiros },
          }),
          ...(user.hierarquia === 'USER'
            ? {
                OR: [{ corretorId: user.id }, { corretorId: null }],
              }
            : {}),
          ...(user.hierarquia === 'CONST' && {
            financeiroId: { in: IdsFineceiros },
          }),
          ...(user.hierarquia === 'GRT' && {
            financeiroId: { in: IdsFineceiros },
          }),
          ...(user.hierarquia === 'CCA' && {
            financeiroId: { in: IdsFineceiros },
          }),
        },
        include: {
          corretor: true,
          construtora: true,
          empreendimento: true,
          financeiro: true,
          alerts: true,
          tags: true,
          chamados: true,
        },
      });

      return plainToClass(SolicitacaoEntity, req);
    } catch (error) {
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
      const { relacionamentos, ...rest } = data;
      const relaData = await this.prisma.solicitacao.findMany({
        where: {
          cpf: {
            in: relacionamentos,
          },
        },
      });
      await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          ...rest,
          corretor: { connect: { id: user.id } },
          financeiro: { connect: { id: data.financeiro } },
          construtora: { connect: { id: data.construtora } },
          empreendimento: { connect: { id: data.empreendimento } },
        },
      });

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} atualizou a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      const req = await this.prisma.solicitacao.findFirst({
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
          chamados: true,
        },
      });

      return plainToClass(SolicitacaoEntity, req);
    } catch (error) {
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
      await this.prisma.solicitacao.delete({
        where: {
          id: id,
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
  async resendSms(id: number, user: UserPayload): Promise<{ message: string }> {
    try {
      const cliente = await this.prisma.solicitacao.findFirst({
        where: {
          id: id,
        },
        include: {
          construtora: true,
          empreendimento: true,
          financeiro: true,
        },
      });
      const SMS = helloMsg(
        cliente.nome,
        cliente.construtora.fantasia,
        cliente.empreendimento.cidade,
        cliente.financeiro.fantasia,
      );
      const termo = Termos();

      if (cliente.telefone) {
        const send = await this.sms.sendSms(SMS, cliente.telefone);
        if (send.status === 200) {
          await this.sms.sendSms(termo, cliente.telefone);
        }
      }
      if (cliente.telefone2) {
        const send = await this.sms.sendSms(SMS, cliente.telefone2);
        if (send.status === 200) {
          await this.sms.sendSms(termo, cliente.telefone2);
        }
      }

      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} reenviou o SMS para Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return { message: 'SMS enviado com sucesso!' };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: 'Erro ao enviar SMS! ' + error.message,
      };
      throw new HttpException(retorno, 400);
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
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Toggle the 'statusAtendimento' flag of a solicitacao.
   * If the flag is true, sets it to false, and vice versa.
   * Logs the pause event.
   *
   * @param {any} body - The request body containing the 'pause' flag.
   * @param {number} id - The ID of the solicitacao to be toggled.
   * @param {any} user - The user performing the toggle.
   * @returns {Promise<SolicitacaoEntity>} - The updated solicitacao.
   * @throws {HttpException} - If an error occurs during the toggling process.
   */
  async pause(body: any, id: number, user: any): Promise<SolicitacaoEntity> {
    try {
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} ${body.pause ? 'pausou' : 'retomou'} a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      const req = await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          ...body,
          ...(body.pause
            ? { statusAtendimento: false }
            : { statusAtendimento: true }),
        },
        include: {
          corretor: true,
          construtora: true,
          empreendimento: true,
          financeiro: true,
          alerts: true,
          tags: true,
          chamados: true,
        },
      });
      return plainToClass(SolicitacaoEntity, req);
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Busca um registro do Fcweb pelo seu ID.
   * @param {number} id - ID do registro do Fcweb.
   * @returns {Promise<{ id: number; andamento: string; dt_agenda: Date; hr_agenda: string; dt_aprovacao: Date; hr_aprovacao: string; }>} - Registro do Fcweb encontrado.
   */
  async GetFcweb(
    id: number,
  ): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
  }> {
    try {
      const fcweb = await this.fcwebProvider.findByIdMin(id);
      if (!fcweb) {
        throw new Error(`Registro com ID ${id} não encontrado`);
      }
      return fcweb;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
