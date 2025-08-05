import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiretoDto } from './dto/create-direto.dto';
import { UpdateDiretoDto } from './dto/update-direto.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorDiretoEntity } from './entities/erro.direto.entity';
import { Direto } from './entities/direto.entity';
import { plainToClass } from 'class-transformer';
import { AllDireto } from './entities/direto.list.entity';
import { LogService } from 'src/log/log.service';
import { UserFinanceirasEntity } from './entities/user-financeiras.entity';
import { SolicitacaoService } from '../solicitacao/solicitacao.service';
import { filterSolicitacaoDto } from '../solicitacao/dto/filter-solicitacao.dto';
import { SolicitacaoAllEntity } from '../solicitacao/entities/solicitacao.propety.entity';
import { ErrorEntity } from 'src/entities/error.entity';
import { UpdateFcwebDto } from '../solicitacao/dto/update-fcweb.dto';
import { UserPayload } from 'src/auth/entities/user.entity';
import { FcwebEntity } from '../solicitacao/entities/fcweb.entity';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { ErrorService } from 'src/error/error.service';

@Injectable()
export class DiretoService {
  constructor(
    private readonly prismaService: PrismaService,
    private Log: LogService,
    private fcwebProvider: FcwebProvider,
    private LogError: ErrorService,
  ) {}
  private readonly logger = new Logger(DiretoService.name, {
    timestamp: true,
  });
  async create(createClienteDto: CreateDiretoDto) {
    try {
      const Exist = await this.prismaService.solicitacao.findFirst({
        where: {
          cpf: createClienteDto.cpf,
        },
      });
      if (Exist) {
        const retorno: ErrorDiretoEntity = {
          message: 'Cpf ja cadastrado',
        };
        throw new HttpException(retorno, 400);
      }
      const req = await this.prismaService.solicitacao.create({
        data: {
          ...createClienteDto,
          ...(createClienteDto.financeiro && {
            financeiro: {
              connect: {
                id: createClienteDto.financeiro,
              },
            },
          }),
          direto: true,
        },
      });
      if (!req) {
        const retorno: ErrorDiretoEntity = {
          message: 'ERRO AO CRIAR CLIENTE',
        };
        throw new HttpException(retorno, 400);
      }
      return plainToClass(Direto, req);
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
    filtro: filterSolicitacaoDto,
    UserData: any,
  ) {
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
          andamento: andamento,
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

      const count = await this.prismaService.solicitacao.count({
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

      let req = await this.prismaService.solicitacao.findMany({
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
                await this.prismaService.solicitacao.update({
                  where: { id: item.id },
                  data: {
                    andamento: ficha.andamento,
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
      const request = await this.prismaService.solicitacao.findUnique({
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
      this.prismaService.$disconnect;
    }
  }

  async update(id: number, updateDiretoDto: UpdateDiretoDto, User: any) {
    try {
      const request = await this.prismaService.solicitacao.update({
        where: {
          id: id,
          direto: true,
        },
        data: {
          ...updateDiretoDto,
          ...(updateDiretoDto.financeiro && {
            financeiro: {
              connect: {
                id: updateDiretoDto.financeiro,
              },
            },
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
      this.prismaService.$disconnect;
    }
  }

  async remove(id: number, User: any) {
    try {
      const request = await this.prismaService.solicitacao.update({
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
      this.prismaService.$disconnect;
    }
  }

  async getFinanceirosDoUsuario(id: number) {
    if (!id) {
      return null;
    }
    this.logger.error(`Buscando Financeiros do Usuário ${id}`);
    try {
      const usuarioComFinanceiros = await this.prismaService.user.findUnique({
        where: {
          id: id,
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
        return null;
      }

      const financeirosFormatados = usuarioComFinanceiros.financeiros.map(
        (item) => new UserFinanceirasEntity(item.financeiro),
      );

      return financeirosFormatados;
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Financeiros do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async GetFcweb(id: number): Promise<FcwebEntity | null> {
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
  async GetFcwebExist(cpf: string): Promise<FcwebEntity | null> {
    if (!cpf) {
      this.logger.warn('CPF não fornecido para busca no Fcweb');
      return null;
    }

    try {
      const fcweb = await this.fcwebProvider.findByCpf(cpf);
      if (!fcweb) {
        this.logger.warn(`Nenhum registro encontrado para o CPF: ${cpf}`);
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
      const solicitacaoAtualizada = await this.prismaService.solicitacao.update(
        {
          where: { id },
          data: { ...data },
        },
      );

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
}
