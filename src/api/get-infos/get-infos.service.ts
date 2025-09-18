import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';
import { GetInfoTermos } from './entities/get-info.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GetInfoSolicitacaoEntity } from './entities/get-info-solicitacao-entity';
import { GetCorretorDto } from './dto/getCorretor.dto';
import { FilterInfosDto } from './dto/filter-infos.dto';
import { GetOptionsDto } from './dto/get-options.dto';
import { Prisma } from '@prisma/client';

interface DynamicOptionsResponse {
  construtoras: { id: number; fantasia: string }[];
  empreendimentos: { id: number; nome: string }[];
  financeiras: { id: number; fantasia: string }[];
  corretores: { id: number; nome: string }[];
}
@Injectable()
export class GetInfosService {
  constructor(private prismaService: PrismaService) {}
  async checkCpf(cpf: string, user: any) {
    try {
      if (user.hierarquia === 'ADM') {
        const Exist = await this.prismaService.read.solicitacao.findMany({
          where: {
            cpf: cpf,
            direto: false,
            OR: [
              {
                andamento: {
                  notIn: ['APROVADO', 'EMITIDO', 'REVOGADO'],
                },
              },
              {
                distrato: true,
              },
            ],
          },
        });
        console.log("🚀 ~ GetInfosService ~ checkCpf ~ Exist:", Exist)
        if (Exist && Exist.length > 0) {
          return plainToInstance(GetInfoSolicitacaoEntity, Exist, {});
        }

        return [];
      }
      const Exist = await this.prismaService.read.solicitacao.findMany({
        where: {
          cpf: cpf,
          direto: false,
          OR: [
            {
              andamento: {
                notIn: ['APROVADO', 'EMITIDO', 'REVOGADO'],
              },
            },
            {
              ativo: true,
            },
          ],
        },
      });

      console.log("🚀 ~ GetInfosService ~ checkCpf ~ Exist:", Exist)

      if (Exist && Exist.length > 0) {
        return plainToInstance(GetInfoSolicitacaoEntity, Exist, {
          excludeExtraneousValues: true,
        });
      }

      return [];
    } catch (error) {
      console.error('Erro na consulta get-infos:', error);

      // Retorna array vazio para evitar travamento do sistema
      return {
        corretores: [],
        financeiros: [],
      };
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }

  async getTermos() {
    try {
      const req = await this.prismaService.read.termo.findFirst();
      return req.termo;
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }
  async getPoliticas(): Promise<GetInfoTermos> {
    try {
      const req = await this.prismaService.read.termo.findFirst({
        where: {
          id: 1,
        },
      });
      return plainToClass(GetInfoTermos, req);
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }

  /**
   * Busca opções administrativas baseadas nos filtros fornecidos
   * Retorna diferentes tipos de dados dependendo dos filtros aplicados:
   * - Sem filtros: lista de construtoras
   * - Com construtoraId: lista de empreendimentos
   * - Com construtoraId + empreendimentoId: lista de financeiros
   * - Com todos os filtros: lista de usuários
   */
  async getOptionsAdmin(filter: FilterInfosDto) {
    try {
      // Validação de entrada
      this.validateFilterInput(filter);

      // Determina qual operação executar baseada nos filtros
      if (this.hasAllFilters(filter)) {
        return await this.getUsersByFilters(filter);
      }
      
      if (this.hasConstructorAndDevelopmentFilters(filter)) {
        return await this.getFinanceirosByFilters(filter);
      }
      
      if (this.hasConstructorFilter(filter)) {
        return await this.getEmpreendimentosByConstructor(filter.construtoraId);
      }
      
      return await this.getAllConstrutoras();
    } catch (error) {
      this.handleError(error, 'Erro ao buscar opções administrativas');
    }
  }

  /**
   * Valida os dados de entrada do filtro
   */
  private validateFilterInput(filter: FilterInfosDto): void {
    if (!filter) {
      throw new HttpException(
        { message: 'Filtro é obrigatório' },
        400
      );
    }
  }

  /**
   * Verifica se possui apenas filtro de construtora
   */
  private hasConstructorFilter(filter: FilterInfosDto): boolean {
    return filter.construtoraId > 0 && 
           (!filter.empreendimentoId || filter.empreendimentoId <= 0) &&
           (!filter.financeiroId || filter.financeiroId <= 0);
  }

  /**
   * Verifica se possui filtros de construtora e empreendimento
   */
  private hasConstructorAndDevelopmentFilters(filter: FilterInfosDto): boolean {
    return filter.construtoraId > 0 && 
           filter.empreendimentoId > 0 &&
           (!filter.financeiroId || filter.financeiroId <= 0);
  }

  /**
   * Verifica se possui todos os filtros
   */
  private hasAllFilters(filter: FilterInfosDto): boolean {
    return filter.construtoraId > 0 && 
           filter.empreendimentoId > 0 && 
           filter.financeiroId > 0;
  }

  /**
   * Busca todos as construtoras disponíveis
   */
  private async getAllConstrutoras() {
    const construtoras = await this.prismaService.read.construtora.findMany({
      select: {
        id: true,
        fantasia: true,
      },
    });

    if (!construtoras || construtoras.length === 0) {
      throw new HttpException(
        { message: 'Nenhuma construtora encontrada' },
        404
      );
    }

    return construtoras;
  }

  /**
   * Busca empreendimentos por construtora
   */
  private async getEmpreendimentosByConstructor(construtoraId: number) {
    const empreendimentos = await this.prismaService.read.empreendimento.findMany({
      where: {
        construtoraId,
      },
      select: {
        id: true,
        nome: true,
      },
    });

    if (!empreendimentos || empreendimentos.length === 0) {
      throw new HttpException(
        { message: 'Nenhum empreendimento encontrado para essa construtora' },
        404
      );
    }

    return empreendimentos;
  }

  /**
   * Busca financeiros baseado nos filtros de construtora e empreendimento
   */
  private async getFinanceirosByFilters(filter: FilterInfosDto) {
    const [empreendimentos] = await Promise.all([
      this.prismaService.read.financeiroEmpreendimento.findMany({
        where: { empreendimentoId: filter.empreendimentoId },
        select: { financeiroId: true },
      }),
    ]);

    const uniqueFinanceiroIds = empreendimentos.map((e) => e.financeiroId);

    if (uniqueFinanceiroIds.length === 0) {
      throw new HttpException(
        {
          message:
            'Nenhum financeiro encontrado com relacionamento entre empreendimento e construtora',
        },
        404,
      );
    }

    const financeiros = await this.prismaService.read.financeiro.findMany({
      where: {
        id: { in: uniqueFinanceiroIds },
      },
      select: {
        id: true,
        fantasia: true,
      },
    });

    return financeiros;
  }

  
  /**
   * Extrai IDs únicos de financeiros de múltiplas fontes
   */
  private getUniqueFinanceiroIds(
    empreendimentos: { financeiroId: number }[],
    construtoras: { financeiroId: number }[]
  ): number[] {
    const allFinanceiros = [...empreendimentos, ...construtoras];
    return Array.from(new Set(allFinanceiros.map(f => f.financeiroId)));
  }

  /**
   * Busca usuários baseado em todos os filtros
   */
  private async getUsersByFilters(filter: FilterInfosDto) {
  
    const usuarios = await this.prismaService.read.user.findMany({
      where: {
       construtoras: {
         some: {
           construtoraId: filter.construtoraId,
         },
       },
       empreendimentos: {
         some: {
           empreendimentoId: filter.empreendimentoId,
         },
       },
       financeiros: {
         some: {
           financeiroId: filter.financeiroId,
         },
       },
      },
      select: {
        id: true,
        nome: true,
      },
    });

    return usuarios;
  }

  /**
   * Extrai IDs únicos de usuários de múltiplas fontes
   */
  private getUniqueUserIds(
    construtoras: { userId: number }[],
    empreendimentos: { userId: number }[],
    financeiros: { userId: number }[]
  ): number[] {
    const allUsers = [...construtoras, ...empreendimentos, ...financeiros];
    return Array.from(new Set(allUsers.map(u => u.userId)));
  }

  /**
   * Trata erros de forma centralizada
   */
  private handleError(error: any, defaultMessage: string): never {
    const message = error.message || defaultMessage;
    const statusCode = error.status || 500;
    
    const errorResponse: GetInfoErrorEntity = { message };
    throw new HttpException(errorResponse, statusCode);
  }

  
  async getOptionsUser(user: any) {
    try {
      const req = await this.prismaService.read.construtora.findMany({
        where: {
          id: {
            in: user.construtora,
          },
        },
        select: {
          id: true,
          fantasia: true,
          empreendimentos: {
            where: {
              id: {
                in: user.empreendimento,
              },
            },
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      const data = req.map((item) => ({
        id: item.id,
        fantasia: item.fantasia,
        empreendimentos: item.empreendimentos,
      }));

      return data;
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async getCorretores(data: GetCorretorDto) {
    try {
      // Busca os financeiros associados ao empreendimento
      const financeiros =
        await this.prismaService.read.financeiroEmpreendimento.findMany({
          where: { empreendimentoId: data.empreendimentoId },
          select: { financeiro: { select: { id: true, fantasia: true } } },
        });

      const financeirosIds = financeiros.map((f) => f.financeiro.id);

      // Se não houver financeiros, retorna array vazio
      if (financeirosIds.length === 0) {
        return [];
      }

      // Busca os corretores que atendem aos critérios
      const corretores = await this.prismaService.read.user.findMany({
        where: {
          empreendimentos: {
            some: { empreendimentoId: data.empreendimentoId },
          },
          construtoras: { some: { construtoraId: data.construtoraId } },
          financeiros: { some: { financeiro: { id: { in: financeirosIds } } } },
        },
        select: { id: true, nome: true },
      });

      return corretores;
    } catch (error) {
      console.error('Erro ao obter corretores:', error);
      // Em caso de erro, retorna array vazio para evitar falhas no front-end
      return [];
    } finally {
      await this.prismaService.read.$disconnect();
    }
  }

  async getDynamicOptions(
    user: any,
    query: GetOptionsDto,
  ): Promise<DynamicOptionsResponse> {
    const isAdmin = user.hierarquia === 'ADM';
    const response: DynamicOptionsResponse = {
      construtoras: [],
      empreendimentos: [],
      financeiras: [],
      corretores: [],
    };

    try {
      const construtoraWhere: Prisma.ConstrutoraWhereInput = {};
      if (!isAdmin) {
        construtoraWhere.id = {
          in: user.construtora,
        };
      }

      response.construtoras =
        await this.prismaService.read.construtora.findMany({
          where: construtoraWhere,
          select: { id: true, fantasia: true },
        });

      if (!query.construtoraId) {
        return response;
      }

      const empreendimentoWhere: Prisma.EmpreendimentoWhereInput = {
        construtoraId: parseInt(query.construtoraId),
      };
      if (!isAdmin) {
        empreendimentoWhere.id = {
          in: user.empreendimento,
        };
      }
      response.empreendimentos =
        await this.prismaService.read.empreendimento.findMany({
          where: empreendimentoWhere,
          select: { id: true, nome: true },
        });

      if (response.empreendimentos.length === 0) {
        return response;
      }
      if (!query.empreendimentoId) {
        return response;
      }

      const parsedEmpreendimentoId = parseInt(query.empreendimentoId);
      const isEmpreendimentoValid = response.empreendimentos.some(
        (empreendimento) => empreendimento.id === parsedEmpreendimentoId,
      );

      if (!isEmpreendimentoValid) {
        return response;
      }

      const financeirasData =
        await this.prismaService.read.financeiroEmpreendimento.findMany({
          where: {
            empreendimentoId: parsedEmpreendimentoId,
          },
          select: {
            financeiro: {
              select: { id: true, fantasia: true },
            },
          },
        });
      response.financeiras = financeirasData.map((item) => item.financeiro);

      if (response.financeiras.length === 0) {
        return response;
      }

      if (!query.financeiroId) {
        return response;
      }

      const parsedFinanceiraId = parseInt(query.financeiroId);
      const isFinanceiraValid = response.financeiras.some(
        (financeira) => financeira.id === parsedFinanceiraId,
      );

      if (!isFinanceiraValid) {
        return response;
      }

      response.corretores = await this.prismaService.read.user.findMany({
        where: {
          construtoras: {
            some: { construtoraId: parseInt(query.construtoraId) },
          },
          empreendimentos: {
            some: { empreendimentoId: parsedEmpreendimentoId },
          },
          financeiros: {
            some: { financeiroId: parsedFinanceiraId },
          },
        },
        select: { id: true, nome: true },
      });

      
      return response;
    } catch (error) {
      console.error('Erro ao buscar opções dinâmicas:', error);
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO AO PROCESSAR OPÇÕES',
      };
      throw new HttpException(retorno, 500);
    }
  }
}
