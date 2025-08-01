import { Logger, HttpException, Injectable } from '@nestjs/common';
import { CreateDiretoTagDto } from './dto/create-direto-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DiretoTagEntity } from './entities/direto-tag.entity';
import { plainToClass } from 'class-transformer';
import { UserPayload } from 'src/auth/entities/user.entity';
import { LogService } from 'src/log/log.service';
import { SolicitacaoService } from '../solicitacao/solicitacao.service';

@Injectable()
export class DiretoTagService {
  constructor(
    private readonly Prisma: PrismaService,
    private Log: LogService,
    private Cliente: SolicitacaoService,
  ) {}
  private readonly logger = new Logger(DiretoTagService.name, {
    timestamp: true,
  });

  async create(
    createDiretoTagDto: CreateDiretoTagDto,
    User: UserPayload,
  ): Promise<DiretoTagEntity> {
    try {
      let direto = await this.Prisma.direto.findFirst({
        where: { solicitacaoId: createDiretoTagDto.diretoId },
      });

      if (!direto) {
        direto = await this.Prisma.direto.create({
          data: { solicitacaoId: createDiretoTagDto.diretoId },
        });
      }

      const tagList = await this.Prisma.tagList.findUnique({
        where: { id: createDiretoTagDto.tagId },
      });
      if (!tagList) {
        throw new HttpException({ message: 'Tag não encontrada' }, 404);
      }

      const res = await this.Prisma.diretoTag.create({
        data: {
          diretoId: direto.id,
          descricao: tagList.label,
        },
      });

      const cliente = await this.Cliente.GetSolicitacaoById(
        createDiretoTagDto.diretoId,
      );

      await this.Log.Post({
        User: User.id,
        EffectId: createDiretoTagDto.diretoId,
        Rota: 'direto-tag',
        Descricao: `O Usuario ${User.id}-${
          User.nome
        } criou a tag ${tagList.label} para o direto ${
          createDiretoTagDto.diretoId
        } - ${cliente.nome} - ${new Date().toLocaleDateString(
          'pt-BR',
        )} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(DiretoTagEntity, res);
    } catch (error) {
      this.logger.error('Erro ao criar tag:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async findAll(): Promise<DiretoTagEntity[]> {
    try {
      const req = await this.Prisma.diretoTag.findMany();
      return req.map((item: any) => plainToClass(DiretoTagEntity, item));
    } catch (error) {
      this.logger.error('Erro ao buscar tags:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async findOne(id: number): Promise<DiretoTagEntity> {
    try {
      const req = await this.Prisma.diretoTag.findUnique({
        where: { id },
      });
      return plainToClass(DiretoTagEntity, req);
    } catch (error) {
      this.logger.error('Erro ao buscar tag:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async findDiretoAll(solicitacaoId: number): Promise<DiretoTagEntity[]> {
    try {
      const direto = await this.Prisma.direto.findFirst({
        where: { solicitacaoId: solicitacaoId },
      });

      if (!direto) {
        return [];
      }

      const req = await this.Prisma.diretoTag.findMany({
        where: { diretoId: direto.id },
      });
      return req.map((item: any) => plainToClass(DiretoTagEntity, item));
    } catch (error) {
      this.logger.error('Erro ao buscar tags:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async remove(id: number, User: UserPayload): Promise<{ message: string }> {
    try {
      const tag = await this.Prisma.diretoTag.findUnique({
        where: { id },
        include: { Direto: true },
      });

      if (!tag) {
        throw new HttpException('Tag a ser deletada não encontrada', 404);
      }

      await this.Prisma.diretoTag.delete({
        where: { id },
      });

      if (!tag.Direto || !tag.Direto.solicitacaoId) {
        this.logger.warn(`Could not find solicitacaoId for deleted tag ${id}`);
        return { message: 'Tag excluida com sucesso' };
      }

      const cliente = await this.Cliente.findOne(tag.Direto.solicitacaoId, User);

      await this.Log.Post({
        User: User.id,
        EffectId: cliente.id,
        Rota: 'direto-tag',
        Descricao: `O Usuario ${User.id}-${
          User.nome
        } deletou a tag ${id} para o cliente ${cliente.id} - ${
          cliente.nome
        } - ${new Date().toLocaleDateString(
          'pt-BR',
        )} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return { message: 'Tag excluida com sucesso' };
    } catch (error) {
      this.logger.error(
        'Erro ao deletar tag:',
        JSON.stringify(error, null, 2),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: error.message }, 400);
    }
  }
}
