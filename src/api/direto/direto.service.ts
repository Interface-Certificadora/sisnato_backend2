import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateDiretoDto } from './dto/create-direto.dto';
import { UpdateDiretoDto } from './dto/update-direto.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorDiretoEntity } from './entities/erro.direto.entity';
import { Direto } from './entities/direto.entity';
import { plainToClass } from 'class-transformer';
import { AllDireto } from './entities/direto.list.entity';
import { LogService } from 'src/log/log.service';
import { UserFinanceirasEntity } from './entities/user-financeiras.entity';

@Injectable()
export class DiretoService {
  constructor(
    private readonly prismaService: PrismaService,
    private Log: LogService,
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

  async findAll() {
    try {
      const request = await this.prismaService.solicitacao.findMany({
        where: {
          direto: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao buscar Clientes',
        };
        throw new HttpException(retorno, 400);
      }

      return request.map((item) =>
        plainToClass(AllDireto, item, { excludeExtraneousValues: true }),
      );
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
}
