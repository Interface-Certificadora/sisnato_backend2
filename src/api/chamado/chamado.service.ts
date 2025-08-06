import { HttpException, Injectable } from '@nestjs/common';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../log/log.service';
import { ErrorChamadoEntity } from './entities/chamado.error.entity';
import { plainToClass } from 'class-transformer';
import { Chamado } from './entities/chamado.entity';
import { UserPayload } from 'src/auth/entities/user.entity';
import { ErrorService } from 'src/error/error.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChamadoService {
  constructor(
    private prismaService: PrismaService,
    private Log: LogService,
    private LogError: ErrorService,
  ) {}
  async create(createChamadoDto: CreateChamadoDto, user: UserPayload) {
    try {
      const { solicitacaoId, temp, images, ...rest } = createChamadoDto;
      const req = await this.prismaService.write.chamado.create({
        data: {
          ...rest,
          solicitacaoId: solicitacaoId,
          temp: temp ?? [],
          images: images ?? [],
        },
      });

      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não cadastrado',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: user.id,
        EffectId: req.id,
        Rota: 'Chamado',
        Descricao: `Chamado Cadastrado por ${user.id}-${user.nome} no sistema com o ID: ${req.id} para a Solicitacao: ${solicitacaoId}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Chamado, req);
      return null;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    }
  }

  // async findAll(User: UserPayload) {
  //   try {
  //     const req = await this.prismaService.chamado.findMany({
  //       where: {
  //         ...(User.hierarquia === 'ADM' ? {
  //          status: {not: 'Fechado'},
  //          AND: [
  //           {
  //             createAt: {
  //               gte: new Date(new Date().setDate(new Date().getDate() - 30)),
  //             }
  //           }
  //          ]
  //         } : { status: { not: 'Fechado' } }),
  //       },
  //       orderBy: {
  //         status: 'asc',
  //       },
  //     });
  //     if (!req) {
  //       const retorno: ErrorChamadoEntity = {
  //         message: 'Chamados não encontrados',
  //       };
  //       throw new HttpException(retorno, 404);
  //     }
  //     return req.map((item) => plainToClass(Chamado, item));
  //   } catch (error) {
  //     this.LogError.Post(JSON.stringify(error, null, 2));
  //     const retorno: ErrorChamadoEntity = {
  //       message: error.message ? error.message : 'Erro Desconhecido',
  //     };
  //     throw new HttpException(retorno, 500);
  //   }
  // }

  async findAll(userPayload: UserPayload) {
    // Renomeado 'User' para 'userPayload'
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const conditions = []; // Começa com um array vazio para as condições

      if (userPayload.hierarquia === 'ADM') {
        conditions.push(Prisma.sql`c.status <> ${'Fechado'}`);
        conditions.push(Prisma.sql`c."createAt" >= ${thirtyDaysAgo}`);
      } else {
        // Para usuários não-ADM
        conditions.push(Prisma.sql`c.status <> ${'Fechado'}`);

        conditions.push(Prisma.sql`c."idUser" = ${userPayload.id}`);
      }

      const whereClause = Prisma.sql`${Prisma.join(conditions, ' AND ')}`;

      const query = Prisma.sql`
    SELECT 
      c.*,
      u.id as user_id,
      u.nome as user_nome,
      u.email as user_email,
      u.hierarquia as user_hierarquia,
      s.id as solicitacao_id,
      s.nome as solicitacao_nome
    FROM "Chamado" c
    LEFT JOIN "User" u ON c."idUser" = u."id"
    LEFT JOIN "Solicitacao" s ON c."solicitacaoId" = s."id"
    WHERE ${whereClause}
    ORDER BY c.status ASC
  `;
      const resultadoRaw: any[] =
        await this.prismaService.read.$queryRaw(query);

      if (!resultadoRaw || resultadoRaw.length === 0) {
        const retorno = [];
        return retorno;
      }
      return resultadoRaw;
    } catch (error) {
      console.error(
        'Erro em findAll Chamados:',
        JSON.stringify(error, null, 2),
      );

      const message =
        error instanceof HttpException
          ? error.getResponse()
          : error.message || 'Erro Desconhecido';
      const statusCode =
        error instanceof HttpException ? error.getStatus() : 500;

      if (error instanceof HttpException) {
        throw error;
      }

      const retorno: ErrorChamadoEntity = {
        message:
          typeof message === 'string' ? message : JSON.stringify(message),
      };
      throw new HttpException(retorno, statusCode);
    }
  }

  async findOne(id: number) {
    try {
      const req = await this.prismaService.read.chamado.findUnique({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Chamado, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async update(id: number, updateChamadoDto: UpdateChamadoDto, user: any) {
    try {
      const { chat, ...rest } = updateChamadoDto;
      const req = await this.prismaService.write.chamado.update({
        where: {
          id: id,
        },
        data: {
          ...rest,
          ...(chat && { chat: chat ?? [] }),
        },
      });
      if (!req) {
        throw new Error('Chamado não encontrado');
      }
      await this.Log.Post({
        User: user.id,
        EffectId: req.id,
        Rota: 'Chamado',
        Descricao: `Chamado Atualizado por ${user.id}-${user.nome} atulizações: ${JSON.stringify(updateChamadoDto)}, Chamado ID: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Chamado, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };

      throw new HttpException(retorno, 500);
    }
  }

  async remove(id: number, user: any) {
    try {
      const req = await this.prismaService.write.chamado.delete({
        where: {
          id: id,
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'Chamado',
        Descricao: `Chamado Fechado por ${user.id}-${user.nome}, ID do Chamado: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Chamado, req);
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    }
  }

  //VERIFICAR SE ESTA SENDO UTILIZADO
  async pesquisar(query: any) {
    try {
      const whereClause = { ...query };
      if (query.idUser) {
        whereClause.idUser = +query.idUser;
      }

      const req = await this.prismaService.read.chamado.findMany({
        where: whereClause,
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamados não encontrados',
        };
        throw new HttpException(retorno, 404);
      }
      return req.map((item) => plainToClass(Chamado, item));
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async countTotal() {
    try {
      const req = await this.prismaService.read.chamado.count({
        where: {
          status: 'Aberto',
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamados não encontrados',
        };
        throw new HttpException(retorno, 404);
      }
      return req;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    }
  }
}
