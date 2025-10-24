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
      const req = await this.prismaService.chamado.create({
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

  async findAll(userPayload: UserPayload, queryParams: any) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const conditions = [];

      if (userPayload.hierarquia === 'ADM') {
        conditions.push(Prisma.sql`c.status <> ${'Fechado'}`);
        conditions.push(Prisma.sql`c."createAt" >= ${thirtyDaysAgo}`);
      } else {
        conditions.push(Prisma.sql`c.status <> ${'Fechado'}`);
        conditions.push(Prisma.sql`c."idUser" = ${userPayload.id}`);
      }

      if (queryParams.id) {
        conditions.push(Prisma.sql`c.id = ${parseInt(queryParams.id)}`);
      }
      if (queryParams.status) {
        conditions.push(Prisma.sql`c.status = ${queryParams.status}`);
      }
      if (queryParams.prioridade) {
        conditions.push(Prisma.sql`c.prioridade = ${queryParams.prioridade}`);
      }
      if (queryParams.departamento) {
        conditions.push(
          Prisma.sql`c.departamento = ${queryParams.departamento}`,
        );
      }
      if (queryParams.busca) {
        const termoBusca = `%${queryParams.busca}%`;
        conditions.push(
          Prisma.sql`(c.titulo ILIKE ${termoBusca} OR c.descricao ILIKE ${termoBusca} OR u.nome ILIKE ${termoBusca})`,
        );
      }

      const whereClause =
        conditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
          : Prisma.empty;

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
      ${whereClause}
      ORDER BY 
          CASE c.status
              WHEN 'ABERTO' THEN 1
              WHEN 'EM_ANDAMENTO' THEN 2
              WHEN 'CONCLUIDO' THEN 3
              ELSE 4
          END ASC,
          c.id DESC
    `;

      const resultadoRaw: any[] = await this.prismaService.$queryRaw(query);

      return resultadoRaw || [];
    } catch (error) {
      console.error(
        'Erro em findAll Chamados:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException(
        error.message || 'Erro Interno no Servidor',
        error.status || 500,
      );
    }
  }

  async findOne(id: number) {
    try {
      const req = await this.prismaService.chamado.findUnique({
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
      const req = await this.prismaService.chamado.update({
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
      const req = await this.prismaService.chamado.delete({
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

      const req = await this.prismaService.chamado.findMany({
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
      const req = await this.prismaService.chamado.count({
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
