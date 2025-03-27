import { HttpException, Injectable } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { ErrorEntity } from 'src/entities/error.entity';
import { filterSolicitacaoDto } from './dto/filter-solicitacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolicitacaoProperty } from './entities/solicitacao.propety.entity';
import { SolicitacaoAll } from './entities/solicitacao.all.entity';
import { plainToClass } from 'class-transformer';
import helloMsg from './data/hello_msg';
import { SmsService } from 'src/sms/sms.service';
import Termos from './data/termo';
import { UserPayload } from 'src/auth/entities/user.entity';
import { SolicitacaoEntity } from './entities/solicitacao.entity';

@Injectable()
export class SolicitacaoService {
  constructor(
    private prisma: PrismaService,
    private sms: SmsService,
  ) {}

  /**
   * Create a new solicitacao.
   * @param {CreateSolicitacaoDto} data - The data to create the solicitacao.
   * @param {string} sms - The SMS message to be sent.
   * @param {any} user - The user who is creating the solicitacao.
   * @returns {Promise<SolicitacaoAll>} - The created solicitacao.
   */
  async create(data: CreateSolicitacaoDto, sms: string, user: any) {
    try {
      const retorno = await this.prisma.solicitacao.create({
        data: {
          ...data,
          ativo: true,
          corretor: { connect: { id: user.id } },
          financeiro: { connect: { id: data.financeiro } },
          construtora: { connect: { id: data.construtora } },
          empreendimento: { connect: { id: data.empreendimento } },
        },
        include: {
          corretor: {
            select: {
              id: true,
              nome: true,
              telefone: true,
            },
          },
          financeiro: {
            select: {
              id: true,
              fantasia: true,
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
        },
      });
      const construtor = retorno.construtora.fantasia;
      const financeira = retorno.financeiro.fantasia;
      const empreendimento = retorno.empreendimento.cidade;
      const Msg = helloMsg(data.nome, construtor, empreendimento, financeira);
      const termo = Termos();

      if (data.telefone) {
        const send = await this.sms.sendSms(Msg, data.telefone);
        if (send.status === 200) {
          await this.sms.sendSms(termo, data.telefone);
        }
      }
      if (data.telefone2) {
        const send = await this.sms.sendSms(Msg, data.telefone2);
        if (send.status === 200) {
          await this.sms.sendSms(termo, data.telefone2);
        }
      }

      return retorno;
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  /**
   * Retrieves a paginated list of solicitations based on the provided filters and user data.
   *
   * @param {number} pagina - The page number to retrieve.
   * @param {number} limite - The number of items per page.
   * @param {filterSolicitacaoDto} filtro - The filters to apply to the solicitation query.
   * @param {any} UserData - The user data used to determine access permissions and constraints.
   * @returns {Promise<SolicitacaoProperty>} - A promise that resolves to an object containing the total count,
   *   the list of solicitations, the current page, and the number of items per page.
   * @throws {HttpException} - Throws a 400 error if an error occurs during the query.
   */

  async findAll(
    pagina: number,
    limite: number,
    filtro: filterSolicitacaoDto,
    UserData: any,
  ): Promise<SolicitacaoProperty> {
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

      const req = await this.prisma.solicitacao.findMany({
        where: FilterWhere,
        orderBy: {
          id: 'desc',
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          alerts: true,
          distrato: true,
          dt_agendamento: true,
          hr_agendamento: true,
          dt_aprovacao: true,
          hr_aprovacao: true,
          type_validacao: true,
          alertanow: true,
          statusAtendimento: true,
          pause: true,
          andamento: true,
          financeiro: {
            select: {
              id: true,
              fantasia: true,
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
            },
          },
          corretor: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        skip: Offset,
        take: Limite,
      });
      return {
        total: count,
        data: req.map((item) => plainToClass(SolicitacaoAll, item)),
        pagina: PaginaAtual,
        limite: Limite,
      };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

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
          relacionamentos: true,
          chamados: true,
          tags: true,
        },
      });

      return plainToClass(SolicitacaoEntity, req);
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  async update(
    id: number,
    data: UpdateSolicitacaoDto,
    user: UserPayload,
  ): Promise<SolicitacaoEntity> {
    try {
      await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          ...data,
          corretor: { connect: { id: user.id } },
          financeiro: { connect: { id: data.financeiro } },
          construtora: { connect: { id: data.construtora } },
          empreendimento: { connect: { id: data.empreendimento } },
        },
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
          relacionamentos: true,
          chamados: true,
          tags: true,
        },
      });

      return plainToClass(SolicitacaoEntity, req);
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  remove(id: number, user: any) {
    try {
      this.prisma.solicitacao.delete({
        where: {
          id: id,
        },
      });
      return { message: 'Solicitacao excluida com sucesso' };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  async resendSms(id: number) {
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

      return { message: 'SMS enviado com sucesso!', status: 'success' };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  async updateAtivo(id: number, user: any) {
    try {
      const req = await this.prisma.solicitacao.findFirst({
        where: { id },
        select: { ativo: true },
      });
      if (req.ativo) throw new Error('Solicitação ja Ativa');

      const log = `O usuário: ${user?.nome}, id: ${user?.id} reativou esse registro em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`;

      await this.prisma.solicitacao.update({
        where: { id },
        data: { ativo: true },
      });
      return { message: 'Solicitação Reativada com sucesso' };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  async FilterDoc(cpf: string) {
    try {
      const req = this.prisma.solicitacao.findMany({
        where: { cpf },
      });
      return req;
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  async Atendimento(id: number, user: any) {
    try {
      const status = await this.prisma.solicitacao.findUnique({
        where: { id },
        select: { statusAtendimento: true },
      });

      const log = `O usuário: ${user?.nome}, id: ${user?.id} ${status.statusAtendimento ? 'cancelou o atendimento' : 'iniciou o atendimento'} a esse registro em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`;

      await this.prisma.solicitacao.update({
        where: { id },
        data: { statusAtendimento: !status.statusAtendimento },
      });

      return !status.statusAtendimento;
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  async PostTags(data: any, user: any) {
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
      }
      return { message: 'tag adicionada com susseso' };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }

  async pause(body: any, id: number, user: any) {
    try {
      const log = `O usuário: ${user?.nome}, id: ${user?.id} ${body.pause ? 'pausou' : 'retomou'} esse registro em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`;

      return await this.prisma.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          ...body,
          ...(body.pause
            ? { statusAtendimento: false }
            : { statusAtendimento: true }),
        },
      });
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prisma.$disconnect;
    }
  }
}
