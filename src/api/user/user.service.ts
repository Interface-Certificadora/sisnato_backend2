import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorUserEntity } from './entities/user.error.entity';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const Exist = await this.prismaService.user.findFirst({
        where: {
          username: createUserDto.username,
        },
      });
      if (Exist) {
        const retorno: ErrorUserEntity = {
          message: 'Username ja cadastrado',
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
          message: 'Cpf ja cadastrado',
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
          ...(createUserDto.cargo !== 'ADM'
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
        },
      });

      return plainToClass(User, req);
    } catch (error) {
      console.log(error);
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findAll() {
    try {
      const req = await this.prismaService.user.findMany({
        orderBy: {
          nome: 'asc',
        },
      });
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuarios nao encontrados',
        };
        throw new HttpException(retorno, 404);
      }

      const data = await Promise.all(
        req.map(async (data: any) => {
          const construtoraDb = await this.getUsersByConstrutora(
            data.construtora,
          );

          const empreendimentoDb = await this.getUsersByEmpreendimento(
            data.empreendimento,
          );

          const financeiraDb = await this.getUsersByFinanceira(data.Financeira);

          const Dados = {
            ...data,
            ...(financeiraDb && { financeiros: financeiraDb }),
            ...(construtoraDb && { construtoras: construtoraDb }),
            ...(empreendimentoDb && { empreendimentos: empreendimentoDb }),
          };
          return Dados;
        }),
      );
      return data;
    } catch (error) {
      console.log(error);
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async findOne(id: number) {
    try {
      const req = await this.prismaService.user.findUnique({
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
      console.log(error);
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const req = await this.prismaService.user.update({
        where: {
          id: id,
        },
        data: {
          ...updateUserDto,
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
      console.log(error);
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async updatePassword(id: number, password: string) {
    try {
      const req = await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          password: password,
          password_key: this.generateHash(password),
          reset_password: true,
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
      console.log(error);
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async primeAcess(id: number, updateUserDto: UpdateUserDto) {
    try {
      const senha = this.generateHash(updateUserDto.password);
      const req = this.prismaService.user.update({
        where: {
          id: id,
        },
        data: {
          password: updateUserDto.password,
          password_key: senha,
          reset_password: false,
        },
      });
      console.log('🚀 ~ UserService ~ primeAcess ~ req:', req);
      if (!req) {
        const retorno: ErrorUserEntity = {
          message: 'Usuario nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(User, req);
    } catch (error) {
      console.log(error);
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
      console.log(error);
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
      console.log(error);
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async userTermos(id: number) {
    try {
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
      console.log(error);
      const retorno: ErrorUserEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }

  //EXISTE UM ERRO NA CHAMADA DESSA FUNÇÃO ONDE NÃO É RECONHEDO O UPDATETERMO
  //Property 'updateTermo' does not exist on type 'UserService'.
  //dentro do controller.spec existe o teste comentado para caso de revisão

  async updateTermo(id: number, updateUserDto: UpdateUserDto) {
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
      console.log(error);
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

  async getUsersByConstrutora(construtora: string) {
    try {
      return await this.prismaService.construtora.findMany({
        where: {
          id: {
            in: JSON.parse(construtora),
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
      return error;
    }
  }
}
