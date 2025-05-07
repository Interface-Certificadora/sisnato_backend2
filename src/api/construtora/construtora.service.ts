import { HttpException, Injectable } from '@nestjs/common';
import { CreateConstrutoraDto } from './dto/create-construtora.dto';
import { UpdateConstrutoraDto } from './dto/update-construtora.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorConstrutoraEntity } from './entities/construtora.error.entity';
import { plainToClass } from 'class-transformer';
import { Construtora } from './entities/construtora.entity';
import { LogService } from '../../log/log.service';
import { UserPayload } from 'src/auth/entities/user.entity';

@Injectable()
export class ConstrutoraService {
  constructor(
    private prismaService: PrismaService,
    private Log: LogService,
  ) {}
  async create(createConstrutoraDto: CreateConstrutoraDto, User: any) {
    try {
      const Exist = await this.prismaService.construtora.findUnique({
        where: {
          cnpj: createConstrutoraDto.cnpj,
        },
      });
      if (Exist) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'CNPJ já cadastrado',
        };
        throw new HttpException(retorno, 400);
      }
      const req = await this.prismaService.construtora.create({
        data: {
          ...createConstrutoraDto,
        },
      });
      console.log('🚀 ~ ConstrutoraService ~ create ~ req:', req);
      const teste = await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Construtora',
        Descricao: `Construtora Criada por ${User.id}-${User.nome} no sistema Razão Social: ${req.razaosocial} com o CNPJ: ${req.cnpj} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      console.log('🚀 ~ ConstrutoraService ~ create ~ teste:', teste);
      return plainToClass(Construtora, req);
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAll(User: UserPayload) {
    try {
      const req = await this.prismaService.construtora.findMany({
        where: {
          ...(User.hierarquia !== 'ADM' && { status: true, atividade: { not: 'CERT' }, id: { in: User.construtora } }),

        },
        orderBy: {
          id: 'asc'
        },
        select: {
          id: true,
          razaosocial: true,
          cnpj: true,
          tel: true,
          email: true,
          status: true,
          fantasia: true,
          atividade: true,
          colaboradores: {
            select: {
              user: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  telefone: true,
                  hierarquia: true,
                  cargo: true,
                }
              }
            }
          }
        },
      });
      if (!req || req.length < 1) {
        const retorno = {
          message: 'Nenhuma construtora encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      const retorno = req.map((item) => {
        return {
          ...item,
          colaboradores: item.colaboradores.map((c) => c.user),
        };
      });
      return retorno;
    } catch (error) {
      console.log('🚀 ~ ConstrutoraService ~ findAll ~ error:', error);
      const retorno = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findOne(id: number, User: UserPayload) {
    try {
      const selectAdm = {
        id: true,
        razaosocial: true,
        cnpj: true,
        fantasia: true,
        tel: true,
        email: true,
        obs: true,
        valor_cert: true,
        responsavelId: true,
        status: true,
        atividade: true,
        createdAt: true,
        updatedAt: true,
        colaboradores: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                hierarquia: true,
              }
            }
          }
        }
      }

      const selectUser = {
        id: true,
        razaosocial: true,
        cnpj: true,
        fantasia: true,
        tel: true,
        email: true,
        status: true,
        obs: true,
        createdAt: true,
        updatedAt: true,
        colaboradores: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                hierarquia: true,
              }
            }
          }
        }
      }
      const req = await this.prismaService.construtora.findUnique({
        where: {
          id: id,
          ...User.hierarquia !== 'ADM' ? { status: true } : {},
        },
        select: User.hierarquia === 'ADM' ? selectAdm : selectUser,
      });
      if (!req) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'Construtora não encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      const retorno = {
        ...req,
        colaboradores: req.colaboradores.map((colaborador) => {
          return {
            ...colaborador.user,
          };
        }),
      };
      return retorno;
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async update(
    id: number,
    updateConstrutoraDto: UpdateConstrutoraDto,
    User: any,
  ) {
    try {
      const req = await this.prismaService.construtora.update({
        where: {
          id: id,
        },
        data: {
          ...updateConstrutoraDto,
        },
      });
      if (!req) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'Construtora não encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Construtora',
        Descricao: `Construtora Atualizada por ${User.id}-${User.nome} atualizações: ${JSON.stringify(updateConstrutoraDto)}, Construtora ID: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Construtora, req);
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async remove(id: number, User: any) {
    try {
      const consulta = await this.prismaService.construtora.findUnique({
        where: {
          id: id,
        },
      });
      if (consulta.atividade === 'CERT') {
        throw new Error('Certificadora não pode ser desativada');
      }
      const req = await this.prismaService.construtora.update({
        where: {
          id: id,
        },
        data: {
          status: false,
        },
      });
      if (!req) {
        const retorno: ErrorConstrutoraEntity = {
          message: 'Construtora não encontrada',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Construtora',
        Descricao: `Construtora Desativada por ${User.id}-${User.nome} do sistema Razão Social: ${req.razaosocial} com o CNPJ: ${req.cnpj}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Construtora, req);
    } catch (error) {
      const retorno: ErrorConstrutoraEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
