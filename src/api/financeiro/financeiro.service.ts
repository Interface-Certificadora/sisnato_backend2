import { HttpException, Injectable } from '@nestjs/common';
import { CreateFinanceiroDto } from './dto/create-financeiro.dto';
import { UpdateFinanceiroDto } from './dto/update-financeiro.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorFinanceiroEntity } from './entities/financeiro.error.entity';
import { Financeiro } from './entities/financeiro.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class FinanceiroService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createFinanceiroDto: CreateFinanceiroDto): Promise<Financeiro> {
    const { responsavelId, ...rest } = createFinanceiroDto;
    try{
      const req = await this.prismaService.financeiro.create({
        data: {
          responsavel:{ 
            connect:{
              id :createFinanceiroDto.responsavelId,
            }
          },
          construtoras: {
            connect: createFinanceiroDto.contrutoras.map((id) => ({ id : id})),
          },
          ...rest,
        },
      });
      if(!req){
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        }
        throw new HttpException(retorno, 500);
      }
      return plainToClass(Financeiro, req);
    }catch(error){
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      }
      throw new HttpException(retorno, 500);
    }finally{
      await this.prismaService.$disconnect();
    }
  }

  async findAll(): Promise<Financeiro[]> {
    try{
      const req = await this.prismaService.financeiro.findMany({
        orderBy:{
          fantasia: 'asc',
        },
        include: {
          construtoras: true,
          responsavel: true,
        },
      });
      if(!req){
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        }
        throw new HttpException(retorno, 500);
      }
      return req.map((item) => plainToClass(Financeiro, item));
    }catch(error){
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      }
      throw new HttpException(retorno, 500);
    }finally{
      await this.prismaService.$disconnect();
    }
  }

  async findOne(id: number): Promise<Financeiro> {
    try{
      const req = await this.prismaService.financeiro.findUnique({
        where: {
          id: id,
        },
        include: {
          construtoras: true,
          responsavel: true,
        },
      });
      if(!req){
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        }
        throw new HttpException(retorno, 500);
      }
      return plainToClass(Financeiro, req);
    }catch(error){
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      }
      throw new HttpException(retorno, 500);
    }finally{
      await this.prismaService.$disconnect();
    }
  }

  async update(id: number, updateFinanceiroDto: UpdateFinanceiroDto) {
    try{
      const { responsavelId, ...rest } = updateFinanceiroDto;
      const req = await this.prismaService.financeiro.update({
        where: {
          id: id,
        },
        data: {
          responsavel:{
            connect: {
              id: updateFinanceiroDto.responsavelId,
            }
          },
          ...rest,
        },
      });
      if(!req){
        const retorno: ErrorFinanceiroEntity = {
          message: 'ERRO DESCONHECIDO',
        }
        throw new HttpException(retorno, 500);
      }
      return plainToClass(Financeiro, req);
    }catch(error){
      console.log(error);
      const retorno: ErrorFinanceiroEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      }
      throw new HttpException(retorno, 500);
    }finally{
      await this.prismaService.$disconnect();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} financeiro`;
  }
}
