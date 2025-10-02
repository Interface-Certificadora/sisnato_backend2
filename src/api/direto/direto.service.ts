import { HttpException, Injectable, Logger } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { plainToClass } from 'class-transformer';
import { UserPayload } from 'src/auth/entities/user.entity';
import { ErrorEntity } from 'src/entities/error.entity';
import { ErrorService } from 'src/error/error.service';
import { LogService } from 'src/log/log.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { UpdateFcwebDto } from '../solicitacao/dto/update-fcweb.dto';
import { FcwebEntity } from '../solicitacao/entities/fcweb.entity';
import { SolicitacaoAllEntity } from '../solicitacao/entities/solicitacao.propety.entity';
import { CreateDiretoDto } from './dto/create-direto.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { filterDiretoDto } from './dto/filter-solicitacao.dto';
import { UpdateDiretoDto } from './dto/update-direto.dto';
import { Direto } from './entities/direto.entity';
import { ErrorDiretoEntity } from './entities/erro.direto.entity';
import { UserFinanceirasEntity } from './entities/user-financeiras.entity';
import { GenerateCnabDto } from './dto/generate-cnad.dto';


export interface DecodedCnabData {
  cca: number;
  empreendimento: number;
  corretorId: number;
}

// Tipo para o parâmetro da nossa função unificada
type ProcessarCnabParams =
  | { operation: 'generate'; payload: GenerateCnabDto }
  | { operation: 'parse'; payload: { hash: string } };
@Injectable()
export class DiretoService {
  constructor(
    private readonly prismaService: PrismaService,
    private Log: LogService,
    private jwtService: JwtService,
    private fcwebProvider: FcwebProvider,
    private LogError: ErrorService,
  ) {}
  private readonly logger = new Logger(DiretoService.name, {
    timestamp: true,
  });

  async create(createClienteDto: CreateDiretoDto) {
    try {
      const { token, valor, ...rest } = createClienteDto;
      const {data} = await this.getInfosToken(token);
      const {financeira, empreendimento, corretorId} = data
      const financeiraId = financeira.id
      const empreendimentoId = empreendimento
    
      const check = await this.prismaService.read.solicitacao.findFirst({
        where: {
          cpf: rest.cpf,
          direto: true,
          OR: [
            {
              andamento: {
                notIn: ['EMITIDO', 'APROVADO', 'REVOGADO'],
              },
            },
            {
              ativo: true,
            },
          ],
        },
      });
      if (check) {
        const retorno: ErrorDiretoEntity = {
          message: 'Cpf ja cadastrado',
        };
        throw new HttpException(retorno, 400);
      }
    
      const req = await this.prismaService.write.solicitacao.create({
        data: {
          ...rest,
          financeiro: {
            connect: {
              id: financeiraId,
            },
          },
          empreendimento: {
            connect: {
              id: empreendimentoId,
            },
          },
          corretor: {
            connect: {
              id: corretorId,
            },
          },
          direto: true,
          valorcd: valor,
        },
      })
      return req;
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async findAll(
    pagina: number,
    limite: number,
    filtro: filterDiretoDto,
    UserData: any,
  ) {
    try {
      const { nome, id, andamento, empreendimento, financeiro } = filtro;
      const PaginaAtual = pagina || 1;
      const Limite = !!andamento ? 50 : limite ? limite : 20;
      const Offset = (PaginaAtual - 1) * Limite;
      const EmpId = UserData?.empreendimento || [];
      const FinId = UserData?.Financeira || [];

      const FilterWhere = {
        direto: true,
        ...(UserData?.hierarquia !== 'ADM' && {
          // corretor: UserData.id,
          empreendimento: {
            id: {
              in: EmpId,
            },
          },
          financeiro: {
            id: {
              in: FinId,
            },
          },
          ativo: true,
          distrato: false,
          direto: true,
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
          andamento: andamento,
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

      const count = await this.prismaService.read.solicitacao.count({
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
        pg_andamento: true,
        pg_date: true,
        pg_status: true,
        pixCopiaECola: true,
        imagemQrcode: true,
        txid: true,
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

      let req = await this.prismaService.read.solicitacao.findMany({
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
                const formatTimeString = (timeString: any) => {
                  if (!timeString) return null;
                  // If it's already a valid Date object
                  if (
                    timeString instanceof Date &&
                    !isNaN(timeString.getTime())
                  ) {
                    return timeString;
                  }
                  // Handle MySQL TIME format (HH:MM:SS)
                  if (
                    typeof timeString === 'string' &&
                    timeString.includes(':')
                  ) {
                    const today = new Date();
                    const [hours, minutes, seconds] = timeString
                      .split(':')
                      .map(Number);

                    if (
                      !isNaN(hours) &&
                      !isNaN(minutes) &&
                      (!seconds || !isNaN(seconds))
                    ) {
                      today.setHours(hours, minutes, seconds || 0, 0);
                      return today;
                    }
                  }
                  return null;
                };

                // Helper function to safely parse date values
                const formatDateString = (dateString: any) => {
                  if (!dateString) return null;

                  // If it's already a valid Date object
                  if (
                    dateString instanceof Date &&
                    !isNaN(dateString.getTime())
                  ) {
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
                };
                // Update the database
                await this.prismaService.write.solicitacao.update({
                  where: { id: item.id },
                  data: {
                    ...(ficha.nome && { nome: ficha.nome }),
                    ...(ficha.id && { id_fcw: ficha.id }),
                    ...(ficha.andamento && { andamento: ficha.andamento }),
                    dt_agendamento: formatDateString(ficha.dt_agenda),
                    hr_agendamento: formatTimeString(ficha.hr_agenda),
                    dt_aprovacao: formatDateString(ficha.dt_aprovacao),
                    hr_aprovacao: formatTimeString(ficha.hr_aprovacao),
                  },
                });
                // Update our local copy
                updatedReq[index] = {
                  ...item,
                  andamento: ficha.andamento,
                  dt_agendamento: formatDateString(ficha.dt_agenda),
                  hr_agendamento: formatTimeString(ficha.hr_agenda),
                  dt_aprovacao: formatDateString(ficha.dt_aprovacao),
                  hr_aprovacao: formatTimeString(ficha.hr_aprovacao),
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

  async findOne(id: number) {
    try {
      const request = await this.prismaService.read.solicitacao.findUnique({
        where: {
          id: id,
          direto: true,
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao buscar Cliente',
        };
        throw new HttpException(retorno, 400);
      }
      return plainToClass(Direto, request);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prismaService.read.$disconnect;
    }
  }

  async update(id: number, updateDiretoDto: UpdateDiretoDto, User: any) {
    try {
      const {
        corretorId,
        construtoraId,
        empreendimentoId,
        financeiroId,
        financeiro,
        ...rest
      } = updateDiretoDto;
      const request = await this.prismaService.write.solicitacao.update({
        where: {
          id: id,
          direto: true,
        },
        data: {
          ...rest,
          ...((financeiro || financeiroId) && {
            financeiro: {
              connect: { id: financeiro || financeiroId },
            },
          }),
          ...(corretorId && {
            corretor: { connect: { id: corretorId } },
          }),
          ...(construtoraId && {
            construtora: { connect: { id: construtoraId } },
          }),
          ...(empreendimentoId && {
            empreendimento: { connect: { id: empreendimentoId } },
          }),
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao atualizar Cliente',
        };
        throw new HttpException(retorno, 400);
      }
      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Direto',
        Descricao: `O Usuário ${User.id}-${User.nome} atualizou a Solicitacao Direto ID: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(Direto, request);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prismaService.write.$disconnect;
    }
  }

  async updateSolicitacao(
    id: number,
    updateDiretoDto: UpdateDiretoDto,
  ) {
    try {
      const {
        corretorId,
        construtoraId,
        empreendimentoId,
        financeiroId,
        financeiro,
        ...rest
      } = updateDiretoDto;
      const request = await this.prismaService.write.solicitacao.update({
        where: {
          id: id,
          direto: true,
        },
        data: {
          ...rest,
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao atualizar Cliente',
        };
        throw new HttpException(retorno, 400);
      }
      const user = await this.prismaService.write.user.findUnique({
        where: {
          id: request.corretorId,
        },
      });
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'Direto',
        Descricao: `O Usuário ${user.id}-${user.nome} atualizou a Solicitacao Direto ID: ${id}, via natoDireto - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(Direto, request);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prismaService.write.$disconnect;
    }
  }

  async remove(id: number, User: any) {
    try {
      const request = await this.prismaService.write.solicitacao.update({
        where: {
          id: id,
          direto: true,
        },
        data: {
          ativo: false,
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao desativar Cliente',
        };
        throw new HttpException(retorno, 400);
      }

      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Direto',
        Descricao: `O Usuário ${User.id}-${User.nome} desativou a Solicitacao Direto ID: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(Direto, request);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prismaService.write.$disconnect;
    }
  }

  async getFinanceirosDoUsuario(user: UserPayload) {
    try {
      if (!user.id) {
        throw new HttpException(
          'Usuário não encontrado, ou não possui id',
          400,
        );
      }
      const usuarioComFinanceiros =
        await this.prismaService.read.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            financeiros: {
              where: {
                financeiro: {
                  direto: true,
                },
              },
              select: {
                financeiro: {
                  select: {
                    id: true,
                    fantasia: true,
                  },
                },
              },
            },
          },
        });

      if (!usuarioComFinanceiros) {
        throw new HttpException(
          {
            message: 'CCa e usuario não possui liberação de para trabalhar',
          },
          400,
        );
      }

      const financeirosFormatados = usuarioComFinanceiros.financeiros.map(
        (item) => new UserFinanceirasEntity(item.financeiro),
      );
      console.log(financeirosFormatados);

      return financeirosFormatados;
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Financeiros do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async GetFcweb(id: number): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
    nome?: string;
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
    nome: string;
  } | null> {
    if (!cpf) {
      this.logger.warn('CPF não fornecido para busca no Fcweb');
      return null;
    }

    try {
      const fcweb = await this.fcwebProvider.findByCpf(cpf);
      if (!fcweb) {
        // this.logger.warn(`Nenhum registro encontrado para o CPF: ${cpf}`);
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
      const solicitacaoAtualizada =
        await this.prismaService.write.solicitacao.update({
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

  async checkCpf(cpf: string) {
    try {
      const request = await this.prismaService.read.solicitacao.findFirst({
        where: {
          cpf: {
            contains: cpf,
          },
          direto: true,
          OR: [
            {
              andamento: {
                notIn: ['EMITIDO', 'APROVADO', 'REVOGADO'],
              },
            },
            {
              andamento: {
                equals: null,
              },
            },
          ],
        },
      });

      return !!request;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkPagamentoCpf(cpf: string) {
    try {
      const request = await this.prismaService.read.solicitacao.findFirst({
        where: {
          cpf: {
            contains: cpf,
          },
          direto: true,
          OR: [
            {
              andamento: {
                notIn: ['EMITIDO', 'APROVADO', 'REVOGADO'],
              },
            },
            {
              andamento: {
                equals: null,
              },
            },
          ],
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          email: true,
          telefone: true,
          andamento: true,
          empreendimentoId: true,
          financeiroId: true,
          construtoraId: true,
          corretor: {
            select: {
              id: true,
              nome: true,
            },
          },
          pg_andamento: true,
          pg_date: true,
          pg_status: true,
          valorcd: true,
        },
      });

      return request;
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async checkFinanceira(id: number) {
    try {
      const request = await this.prismaService.read.financeiro.findFirst({
        where: {
          id: id,
        },
        select: {
          id: true,
          fantasia: true,
          valor_cert: true,
          direto: true,
        },
      });
      if (!request) {
        throw new Error('Financeira não encontrada');
      }
      return request;
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Financeiros do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async atualizarCliente(txid: string, data: any) {
    try {
      const request = await this.prismaService.write.solicitacao.findFirst({
        where: {
          txid: txid,
          direto: true,
        },
      });
      if (!request) {
        throw new Error('Solicitação não encontrada');
      }
      const update = await this.prismaService.write.solicitacao.update({
        where: {
          id: request.id,
        },
        data: {
          pg_andamento: data.pg_andamento,
        },
      });
      return update;
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Solicitação do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async createLink(data: CreateLinkDto, User: UserPayload) {
    try {
      const { baseUrl, financeiroId, empreendimentoId } = data;
      const financeira = await this.checkFinanceira(financeiroId);
      if (!financeira.direto) {
        throw new Error('Financeira não habilitada para Direto');
      }
      const payload = {
        cca: financeiroId,
        empreendimento: empreendimentoId,
        corretorId: User.id,
      };
      const token = (await this.processar({
        operation: 'generate',
        payload: {
          cca: financeiroId,
          empreendimento: empreendimentoId,
          corretorId: User.id,
        },
      })) as string;
      const link = `${baseUrl}?id=${token}`;

      return { message: 'Link criado com sucesso', link };
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Solicitação do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async getInfosToken(token: string) {
    try {
      const data = (await this.processar({
        operation: 'parse',
        payload: { hash: token },
      })) as DecodedCnabData;

      const financeira = await this.checkFinanceira(data.cca);

      if (!financeira.direto) {
        throw new Error('Financeira não habilitada para Direto');
      }

      return {
        success: true,
        message: 'token decodificado com sucesso',
        data: {
          financeira: {
            ...financeira,
            valor_cert: financeira.valor_cert,
          },
          empreendimento: data.empreendimento,
          corretorId: data.corretorId,
        },
      };
    } catch (error) {
      const retorno = {
        success: false,
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
        data: null,
      };
      throw new HttpException(retorno, 500);
    }
  }

  async processar(
    params: ProcessarCnabParams,
  ): Promise<string | DecodedCnabData> {
    try {
      if (params.operation === 'generate') {
        return this.gerarRegistroCnab(params.payload);
      }

      if (params.operation === 'parse') {
        return this.interpretarRegistroCnab(params.payload.hash);
      }
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Solicitação do Usuário');
      const retorno = {
        success: false,
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  private gerarRegistroCnab(data: GenerateCnabDto): string {
    const ccaStr = data.cca.toString().padStart(8, '0');
    const empreendimentoStr = data.empreendimento.toString().padStart(8, '0');
    const corretorIdStr = data.corretorId.toString().padStart(9, '0');

    const registroSimples = `${ccaStr}${empreendimentoStr}${corretorIdStr}`;

    return registroSimples;
  }

  private interpretarRegistroCnab(hash: string): DecodedCnabData {
    if (!hash || hash.length !== 25) {
      throw new HttpException('ID inválido ou malformado.', 400);
    }

    try {
      const ccaStr = hash.substring(0, 8);
      const empreendimentoStr = hash.substring(8, 16);
      const corretorIdStr = hash.substring(16, 25);

      const cca = parseInt(ccaStr, 10);
      const empreendimento = parseInt(empreendimentoStr, 10);
      const corretorId = parseInt(corretorIdStr, 10);

      if (isNaN(cca) || isNaN(empreendimento) || isNaN(corretorId)) {
        throw new Error('O ID inválido ou malformado.');
      }

      return { cca, empreendimento, corretorId };
    } catch (error) {
      throw new HttpException('ID inválido ou malformado.', 400);
    }
  }
}
