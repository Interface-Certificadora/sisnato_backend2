import { HttpException, Injectable } from '@nestjs/common';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorEmpreendimentoEntity } from './entities/empreendimento.error.entity';
import { Empreendimento } from './entities/empreendimento.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class EmpreendimentoService {
  constructor(private prismaService: PrismaService) {}
  async create(createEmpreendimentoDto: CreateEmpreendimentoDto) {
    try {
      const { financeiro, construtoraId, ...rest } = createEmpreendimentoDto;
      const req = await this.prismaService.empreendimento.create({
        data: {
          ...rest,
            construtora: {
              connect:{
                id: construtoraId
              }
            },
        },
      });
      if (!req) {
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      financeiro.forEach(async (item: number) => {
        const ExistFinanceiro = await this.prismaService.financeiro.findUnique({
          where: {
            id: item
          }
        })

        if(ExistFinanceiro) {
          await this.prismaService.financeiroEmpreendimento.create({
            data: {
              empreendimento: {
                connect: {
                  id: req.id
                }
              },
              financeiro: {
                connect: {
                  id: item
                }
              }
            }
          })
        }
      })
      return plainToClass(Empreendimento, req);
    } catch (error) {
      console.log(error);
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAll(user : any) {
    try{
      const financeira = user.financeira;
      const hierarquia = user.hierarquia;
      const construtora = user.construtora;

      const Ids = financeira.map((item: { id: any }) => String(item.id));
      const IdsConst = construtora.map((i: any) => i.id)

      const req = await this.prismaService.empreendimento.findMany({
        where: {
          ...(hierarquia === 'CONST' && {
            OR: Ids.map((id : any) => ({
              financeira:{
                some: {
                  id: id
                }
              }
            }))
          })
        },
        select: {
          id: true,
          nome: true,
          estado: true,
          cidade: true,
          status: true,
        },
        orderBy: {
          nome: 'asc',
        },
      });
      if (!req) {
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimentos nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Empreendimento, item));
    }catch (error) {
      console.log(error);
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }finally {
      await this.prismaService.$disconnect();
    }
  }

  async GetAllSearch(financeira: number, construtora: number) {
    try {
      const req = await this.prismaService.empreendimento.findMany({
        where:{
          construtora: {
            id: construtora
          },
          financeiros: {
            some: {
              financeiroId: financeira
            }
          }
        },
        select: {
          id: true,
          nome: true,
        }
      })

      if (!req) {
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimentos nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Empreendimento, item));
    }catch (error) {
      console.log(error);
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }finally {
      await this.prismaService.$disconnect();
    }
  }

  async findOne(id: number) {
    try{
      const req = await this.prismaService.empreendimento.findUnique({
        where: {
          id: id,
        }
      })
      if(!req){
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Empreendimento, req);
    }catch (error) {
      console.log(error);
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }finally {
      await this.prismaService.$disconnect();
    }
  }

  async update(id: number, updateEmpreendimentoDto: UpdateEmpreendimentoDto) {
    try{
      const { financeiro, ...rest } = updateEmpreendimentoDto;
      const req = await this.prismaService.empreendimento.update({
        where: {
          id: id,
        },
        data: {
          ...rest,
        }
      })
      if(!req){
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      await this.prismaService.financeiroEmpreendimento.deleteMany({
        where: {
          empreendimentoId: id,
        }
      })
      financeiro.forEach(async (item: number) => {
        const ExistFinanceiro = await this.prismaService.financeiro.findUnique({
          where: {
            id: item
          }
        })
        if(ExistFinanceiro) {
          await this.prismaService.financeiroEmpreendimento.create({
            data: {
              financeiro: {
                connect: {
                  id: item
                }
              },
              empreendimento: {
                connect: {
                  id: id
                }
              }
            }
          })
        }
      })
      return plainToClass(Empreendimento, req);
    }catch (error) {
      console.log(error);
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }finally {
      await this.prismaService.$disconnect();
    }
  }

  async remove(id: number) {
    try{
      const isAtivo = await this.prismaService.empreendimento.findUnique({
        where: {
          id: id,
        },
        select:{
          status: true
        }
      })
      if(!isAtivo){
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimento nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      const req = await this.prismaService.empreendimento.update({
        where: {
          id: id,
        },
        data: {
          status: (isAtivo.status ? false : true)
        }
      })
      return plainToClass(Empreendimento, req);
    }catch (error) {
      console.log(error);
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }finally {
      await this.prismaService.$disconnect();
    }
  }

  async GetByConstrutora(id: number) {
    try{
      const req = await this.prismaService.empreendimento.findMany({
        where: {
          construtora: {
            id: id
          }
        },
        select: {
          id: true,
          nome: true,
        }
      })
      if(!req){
        const retorno: ErrorEmpreendimentoEntity = {
          message: 'Empreendimentos nao encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Empreendimento, item));  
    }catch (error) {
      console.log(error);
      const retorno: ErrorEmpreendimentoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }finally {
      await this.prismaService.$disconnect();
    }
  }
}
