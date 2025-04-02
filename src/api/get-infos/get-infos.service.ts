import { HttpException, Injectable } from '@nestjs/common';
import { CreateGetInfoDto } from './dto/create-get-info.dto';
import { UpdateGetInfoDto } from './dto/update-get-info.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';
import { GetInfoTermos } from './entities/get-info.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GetInfosService {
  constructor(private prismaService: PrismaService) {}
  async checkCpf(cpf: string): Promise<boolean> {
    try {
      const Exist = await this.prismaService.solicitacao.findFirst({
        where: {
          cpf: cpf,
        },
      });

      if (Exist) {
        const retorno: GetInfoErrorEntity = {
          message: 'Cpf ja cadastrado',
        };
        throw new HttpException(retorno, 400);
      }

      return false;
    } catch (error) {
      const retorno: GetInfoErrorEntity = {
        message: 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async getTermos(): Promise<GetInfoTermos> {
    try {
      const req = await this.prismaService.termo.findFirst({
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
      await this.prismaService.$disconnect();
    }
  }
}
