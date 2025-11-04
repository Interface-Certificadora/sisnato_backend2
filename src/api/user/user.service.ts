import { HttpException, Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserPayload } from 'src/auth/entities/user.entity';
import { ErrorService } from 'src/error/error.service';
import { LogService } from 'src/log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ErrorUserEntity } from './entities/user.error.entity';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private Log: LogService,
    private LogError: ErrorService,
  ) {}
  private readonly logger = new Logger(UserService.name, { timestamp: true });

  async create(createUserDto: CreateUserDto, UserAdm: UserPayload) {
    try {
      const Exist = await this.prismaService.user.findFirst({
        where: {
          username: createUserDto.username,
        },
      });
      if (Exist) {
        const retorno: ErrorUserEntity = {
          message: 'Usuario invalido, tente outro username',
        };
        throw new HttpException(retorno, 400);
      }
      const ExistEmail = await this.prismaService.user.findFirst({
        where: {
          email: createUserDto.email,
        },
      });
      if (ExistEmail) {
        const retorno: ErrorUserEntity = {
          message: 'Email invalido, email ja cadastrado',
        };
        throw new HttpException(retorno, 400);
      }
      if (createUserDto.password !== createUserDto.passwordConfir) {
        const retorno: ErrorUserEntity = {
          message: 'Senhas nao conferem',
        };
        throw new HttpException(retorno, 400);
      }

      const ExistCpf = await this.prismaService.user.findFirst({
        where: {
          cpf: createUserDto.cpf,
        },
      });
      if (ExistCpf) {
        const retorno: ErrorUserEntity = {
          message: 'Cpf invalido, tente outro cpf',
        };
        throw new HttpException(retorno, 400);
      }

      if (
        createUserDto.empreendimento.length === 0 &&
        UserAdm.hierarquia !== 'ADM'
      ) {
        const retorno: ErrorUserEntity = {
          message: 'Empreendimento deve ser selecionado',
        };
        throw new HttpException(retorno, 400);
      }
      if (
        createUserDto.construtora.length === 0 &&
        UserAdm.hierarquia !== 'ADM'
      ) {
        const retorno: ErrorUserEntity = {
          message: 'Construtora deve ser selecionada',
        };
        throw new HttpException(retorno, 400);
      }
      if (
        createUserDto.Financeira.length === 0 &&
        UserAdm.hierarquia !== 'ADM'
      ) {
        const retorno: ErrorUserEntity = {
          message: 'Financeira deve ser selecionada',
        };
        throw new HttpException(retorno, 400);
      }
      const req = await this.prismaService.user.create({
        data: {
          cpf: createUserDto.cpf,
          nome: createUserDto.nome.toUpperCase(),
          username: createUserDto.username.toUpperCase(),
          telefone: createUserDto.telefone,
          email: createUserDto.email,
          ...(UserAdm.hierarquia !== 'ADM'
            ? {
                construtoras: {
                  create: createUserDto.construtora.map((item: number) => ({
                    construtora: { connect: { id: item } },
                  })),
                },
                empreendimentos: {
                  create: createUserDto.empreendimento.map((item: number) => ({
                    empreendimento: { connect: { id: item } },
                  })),
                },
                financeiros: {
                  create: createUserDto.Financeira.map((item: number) => ({
                    financeiro: { connect: { id: item } },
                  })),
                },
              }
            : {}),
          hierarquia: createUserDto.hierarquia,
          password: createUserDto.password,
          status: false,
          cargo: createUserDto.cargo,
          password_key: this.generateHash(createUserDto.password),
          reset_password: true,
          role: createUserDto.role,
        },
      });
      console.log('🚀 ~ UserService ~ create ~ req:', req);

      return plainToClass(User, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao criar usuario:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findAll(AdmUser: UserPayload) {
    try {
      if (AdmUser.hierarquia === 'ADM') {
        const req = await this.prismaService.user.findMany({
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            nome: true,
            telefone: true,
            email: true,
            hierarquia: true,
            cargo: true,
            status: true,
            createdAt: true,
            construtoras: {
              select: {
                construtora: {
                  select: {
                    id: true,
                    fantasia: true,
                  },
                },
              },
            },
            empreendimentos: {
              select: {
                empreendimento: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
              },
            },
            financeiros: {
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
        if (!req) {
          const retorno: ErrorUserEntity = {
            message: 'Usuarios nao encontrados',
          };
          throw new HttpException(retorno, 404);
        }
        return req;
      }
      const construtoraList = AdmUser.construtora;
      const empreendimentoList = AdmUser.empreendimento;
      const financeiroList = AdmUser.Financeira;
      const req = await this.prismaService.user.findMany({
        where: {
          ...(construtoraList.length > 0 && {
            construtoras: {
              some: {
                construtoraId: {
                  in: construtoraList,
                },
              },
            },
          }),
          ...(empreendimentoList.length > 0 && {
            empreendimentos: {
              some: {
                empreendimentoId: {
                  in: empreendimentoList,
                },
              },
            },
          }),
          ...(financeiroList.length > 0 && {
            financeiros: {
              some: {
                financeiroId: {
                  in: financeiroList,
                },
              },
            },
          }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          construtoras: {
            select: {
              construtora: {
                select: {
                  id: true,
                  fantasia: true,
                },
              },
            },
          },
          empreendimentos: {
            select: {
              empreendimento: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
          financeiros: {
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
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuarios nao encontrados',
        };
        throw new HttpException(retorno, 404);
      }
      return req;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar usuarios:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findOne(id: number) {
    // consulta com timeout para evitar travamentos
    const req = await this.prismaService.executeWithRetry(() =>
      this.prismaService.user.findUnique({
        where: { id },
        include: {
          empreendimentos: {
            select: {
              empreendimento: { select: { id: true, nome: true } },
            },
          },
          construtoras: {
            select: {
              construtora: {
                select: {
                  id: true,
                  fantasia: true,
                },
              },
            },
          },
          financeiros: {
            select: {
              financeiro: {
                select: {
                  id: true,
                  fantasia: true,
                  Intelesign_status: true,
                  Intelesign_price: true,
                  direto: true,
                  valor_cert: true,
                },
              },
            },
          },
        },
      }),
    );

    if (!req) {
      const retorno: ErrorUserEntity = { message: 'Usuario nao encontrado' };
      throw new HttpException(retorno, 404);
    }

    const empreendimentos = (req.empreendimentos || []).map(
      (e) => e.empreendimento,
    );
    const construtoras = (req.construtoras || []).map((c) => c.construtora);
    const financeiros = (req.financeiros || []).map((f) => f.financeiro);
    const user = { ...req, empreendimentos, construtoras, financeiros };
    return plainToClass(User, user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const userExist = await this.prismaService.user.findUnique({
        where: { id },
      });
      if (!userExist) {
        throw new HttpException({ message: 'Usuario nao encontrado' }, 404);
      }

      const { construtora, empreendimento, Financeira, ...rest } =
        updateUserDto;

      const data: any = {
        ...rest,
        ...(rest.nome && { nome: rest.nome?.toUpperCase() }), //nome: rest.nome?.toUpperCase(),
        ...(rest.username && { username: rest.username?.toUpperCase() }), //username: rest.username?.toUpperCase(),
      };
      console.log('🚀 ~ UserService ~ update ~ data:', data);

      if (rest.hierarquia !== 'ADM') {
        if (construtora !== undefined) {
          data.construtoras = {
            deleteMany: {},
            create: construtora.map((item: number) => ({
              construtora: { connect: { id: item } },
            })),
          };
        }

        if (empreendimento !== undefined) {
          const empreendimentoFilter = empreendimento.filter(
            (item: number) => item !== 0,
          );

          if (Array.isArray(empreendimentoFilter)) {
            data.empreendimentos = {
              deleteMany: {},
              create: empreendimentoFilter.map((item: number) => ({
                empreendimento: { connect: { id: item } },
              })),
            };
          }
        }

        if (Financeira !== undefined) {
          data.financeiros = {
            deleteMany: {},
            create: Financeira.map((item: number) => ({
              financeiro: { connect: { id: item } },
            })),
          };
        }
      }

      const req = await this.prismaService.user.update({
        where: { id },
        data,
      });

      return plainToClass(User, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao atualizar usuario:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException(
        { message: error.message || 'ERRO DESCONHECIDO' },
        500,
      );
    }
  }

  async primeAcess(id: number, updateUserDto: UpdateUserDto, ReqUser: User) {
    try {
      const senha = this.generateHash(updateUserDto.password);
      const primeAcess = updateUserDto.password === '1234' ? true : false;
      const req = this.prismaService.user.update({
        where: {
          id: id,
        },
        data: {
          password: updateUserDto.password,
          password_key: senha,
          reset_password: primeAcess,
        },
      });
      console.log('🚀 ~ UserService ~ primeAcess ~ req:', req);
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuario nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: ReqUser.id,
        EffectId: id,
        Rota: 'User',
        Descricao: `Senha Recetada por ${ReqUser.id}-${ReqUser.nome}, ID do Usuario: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(User, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao recetar senha:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async remove(id: number) {
    try {
      const req = await this.prismaService.user.delete({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuario nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(User, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao deletar usuario:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async search(query: QueryUserDto) {
    try {
      const req = await this.prismaService.user.findMany({
        where: {
          ...(query.empreendimento && {
            empreendimentos: {
              some: { empreendimentoId: +query.empreendimento },
            },
          }),
          ...(query.financeiro && {
            financeiros: { some: { financeiroId: +query.financeiro } },
          }),
          ...(query.construtora && {
            construtoras: { some: { construtoraId: +query.construtora } },
          }),
          ...(query.telefone && { telefone: { contains: query.telefone } }),
          ...(query.email && { email: { contains: query.email } }),
          ...(query.cpf && { cpf: { contains: query.cpf } }),
        },
      });
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuarios nao encontrados',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((data: any) => plainToClass(User, data));
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar usuarios:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async userTermos(id: number) {
    try {
      if (!id) {
        const retorno: ErrorUserEntity = {
          message: 'ID do usuário nao informado',
        };
        throw new HttpException(retorno, 400);
      }
      const req = await this.prismaService.user.findUnique({
        where: {
          id: id,
        },
        select: {
          termos: true,
        },
      });
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuário nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(User, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar termos:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  //EXISTE UM ERRO NA CHAMADA DESSA FUNÇÃO ONDE NÃO É RECONHECIDO O UPDATETERMOS
  //Property 'updateTermos' does not exist on type 'UserService'.
  //dentro do controller.spec existe o teste comentado para caso de revisão

  async updateTermos(id: number, updateUserDto: UpdateUserDto) {
    try {
      const req = await this.prismaService.user.update({
        where: {
          id: id,
        },
        data: {
          termos: updateUserDto.termo,
        },
      });
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuario nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(User, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao atualizar termos:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async getCorretorByConstrutora(construtora: number) {
    try {
      const req = await this.prismaService.user.findMany({
        where: {
          construtoras: {
            some: {
              construtoraId: construtora,
            },
          },
        },
        select: {
          id: true,
          nome: true,
          cargo: true,
        },
      });
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuarios nao encontrados',
        };
        throw new HttpException(retorno, 404);
      }

      return req.map((data: any) => plainToClass(User, data));
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar corretor:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async getUsersByConstrutora(construtora: string) {
    try {
      return await this.prismaService.user.findMany({
        where: {
          construtoras: {
            some: {
              construtoraId: {
                in: JSON.parse(construtora),
              },
            },
          },
        },
        select: {
          id: true,
          nome: true,
          cargo: true,
        },
      });
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao trazer construtoras:',
        JSON.stringify(error, null, 2),
      );
      return error;
    }
  }

  async getUsersByEmpreendimento(EmpreendimentoId: string) {
    try {
      return await this.prismaService.empreendimento.findMany({
        where: {
          id: {
            in: JSON.parse(EmpreendimentoId),
          },
        },
        select: {
          id: true,
          nome: true,
          estado: true,
          cidade: true,
        },
      });
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao trazer empreendimentos:',
        JSON.stringify(error, null, 2),
      );
      return error;
    }
  }

  async getUsersByFinanceira(financeira: string) {
    try {
      return await this.prismaService.financeiro.findMany({
        where: {
          id: {
            in: JSON.parse(financeira),
          },
        },
        select: {
          id: true,
          fantasia: true,
          cnpj: true,
          tel: true,
          email: true,
        },
      });
    } catch (error) {
      this.logger.error(
        'Erro ao trazer financeiras:',
        JSON.stringify(error, null, 2),
      );
      this.LogError.Post(JSON.stringify(error, null, 2));
      return error;
    }
  }

  async userRole(id: number) {
    try {
      const req = await this.prismaService.user.findFirst({
        where: {
          id: id,
        },
        include: {
          empreendimentos: {
            select: {
              empreendimento: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
          construtoras: {
            select: {
              construtora: {
                select: {
                  id: true,
                  fantasia: true,
                },
              },
            },
          },
          financeiros: {
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

      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuario nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }

      const retorno = {
        role: req.role,
        reset_password: req.reset_password,
        termos: req.termos,
        status: req.status,
        hierarquia: req.hierarquia,
        construtora: (req.construtoras || []).map((c) => c.construtora),
        empreendimento: (req.empreendimentos || []).map(
          (e) => e.empreendimento,
        ),
        Financeira: (req.financeiros || []).map((f) => f.financeiro),
      };
      return retorno;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error('Erro ao buscar role:', JSON.stringify(error, null, 2));

      if (error.message?.includes('Engine is not yet connected')) {
        this.logger.warn(
          `Database connection issue, letting decorator handle fallback for user ${id}`,
        );
        throw error;
      }

      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }
  // funções auxiliares
  generateHash(password: string) {
    return bcrypt.hashSync(password, 10);
  }
}
