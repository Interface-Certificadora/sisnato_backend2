import { HttpException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { UserPayload } from 'src/auth/entities/user.entity';
import { LogService } from '../../log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateImobiliariaDto } from './dto/create-imobiliaria.dto';
import { UpdateImobiliariaDto } from './dto/update-imobiliaria.dto';
import { Imobiliaria } from './entities/imobiliaria.entity';

@Injectable()
export class ImobiliariaService {
  constructor(
    private prismaService: PrismaService,
    private Log: LogService,
  ) {}

  private readonly listSelect = {
    id: true,
    razaosocial: true,
    cnpj: true,
    tel: true,
    email: true,
    status: true,
    fantasia: true,
    colaboradores: { select: { userId: true } },
  };

  /**
   * Imobiliárias vinculadas ao usuário (busca no banco para refletir
   * alterações feitas depois do login).
   */
  private async imobiliariasDoUsuario(userId: number): Promise<number[]> {
    const vinculos = await this.prismaService.userImobiliaria.findMany({
      where: { userId },
      select: { imobiliariaId: true },
    });
    return vinculos.map((v) => v.imobiliariaId);
  }

  async create(createImobiliariaDto: CreateImobiliariaDto, User: UserPayload) {
    try {
      const Exist = await this.prismaService.imobiliaria.findUnique({
        where: { cnpj: createImobiliariaDto.cnpj },
      });
      if (Exist) {
        throw new HttpException({ message: 'CNPJ já cadastrado' }, 400);
      }

      const req = await this.prismaService.imobiliaria.create({
        data: {
          cnpj: createImobiliariaDto.cnpj,
          razaosocial: createImobiliariaDto.razaosocial,
          fantasia: createImobiliariaDto.fantasia,
          tel: createImobiliariaDto.tel,
          email: createImobiliariaDto.email,
          obs: createImobiliariaDto.obs,
          // Toda imobiliária nasce ativa
          status: true,
        },
      });
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Imobiliaria',
        Descricao: `Imobiliária Criada por ${User.id}-${User.nome} no sistema Razão Social: ${req.razaosocial} com o CNPJ: ${req.cnpj} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(Imobiliaria, req);
    } catch (error) {
      throw new HttpException(
        { message: error.message ? error.message : 'Erro Desconhecido' },
        error.status || 500,
      );
    }
  }

  async findAll(User: UserPayload) {
    try {
      const ids =
        User.hierarquia !== 'ADM'
          ? await this.imobiliariasDoUsuario(User.id)
          : null;

      const req = await this.prismaService.imobiliaria.findMany({
        where: {
          ...(ids && { status: true, id: { in: ids } }),
        },
        orderBy: { fantasia: 'asc' },
        select: this.listSelect,
      });

      return req.map((item) => ({
        ...item,
        colaboradores: item.colaboradores.length,
      }));
    } catch (error) {
      throw new HttpException(
        { message: error.message ? error.message : 'Erro Desconhecido' },
        500,
      );
    }
  }

  /**
   * Lista enxuta de imobiliárias ativas para selects
   * (cadastro de usuário e criação de envelope do NatoSign).
   * ADM vê todas; os demais apenas as imobiliárias relacionadas a eles.
   */
  async findSelect(User: UserPayload) {
    try {
      const ids =
        User.hierarquia !== 'ADM'
          ? await this.imobiliariasDoUsuario(User.id)
          : null;
      return await this.prismaService.imobiliaria.findMany({
        where: { status: true, ...(ids && { id: { in: ids } }) },
        orderBy: { fantasia: 'asc' },
        select: { id: true, fantasia: true, razaosocial: true },
      });
    } catch (error) {
      throw new HttpException(
        { message: error.message ? error.message : 'Erro Desconhecido' },
        500,
      );
    }
  }

  async findOne(id: number, User: UserPayload) {
    try {
      const req = await this.prismaService.imobiliaria.findUnique({
        where: {
          id,
          ...(User.hierarquia !== 'ADM' ? { status: true } : {}),
        },
        select: {
          id: true,
          razaosocial: true,
          cnpj: true,
          fantasia: true,
          tel: true,
          email: true,
          obs: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          colaboradores: {
            select: {
              user: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  telefone: true,
                  hierarquia: true,
                },
              },
            },
          },
        },
      });
      if (!req) {
        throw new HttpException({ message: 'Imobiliária não encontrada' }, 404);
      }
      return {
        ...req,
        colaboradores: req.colaboradores.map((c) => ({ ...c.user })),
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message ? error.message : 'Erro Desconhecido' },
        error.status || 500,
      );
    }
  }

  async update(
    id: number,
    updateImobiliariaDto: UpdateImobiliariaDto,
    User: UserPayload,
  ) {
    try {
      const Exist = await this.prismaService.imobiliaria.findUnique({
        where: { id },
      });
      if (!Exist) {
        throw new HttpException({ message: 'Imobiliária não encontrada' }, 404);
      }

      const req = await this.prismaService.imobiliaria.update({
        where: { id },
        data: {
          ...(updateImobiliariaDto.cnpj && { cnpj: updateImobiliariaDto.cnpj }),
          ...(updateImobiliariaDto.status !== undefined && {
            status: updateImobiliariaDto.status,
          }),
          ...(updateImobiliariaDto.razaosocial && {
            razaosocial: updateImobiliariaDto.razaosocial,
          }),
          ...(updateImobiliariaDto.tel !== undefined && {
            tel: updateImobiliariaDto.tel,
          }),
          ...(updateImobiliariaDto.email !== undefined && {
            email: updateImobiliariaDto.email,
          }),
          ...(updateImobiliariaDto.fantasia && {
            fantasia: updateImobiliariaDto.fantasia,
          }),
          ...(updateImobiliariaDto.obs !== undefined && {
            obs: updateImobiliariaDto.obs,
          }),
        },
      });
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Imobiliaria',
        Descricao: `Imobiliária Atualizada por ${User.id}-${User.nome} atualizações: ${JSON.stringify(updateImobiliariaDto)}, Imobiliária ID: ${req.id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return req;
    } catch (error) {
      throw new HttpException(
        { message: error.message ? error.message : 'Erro Desconhecido' },
        error.status || 500,
      );
    }
  }

  async remove(id: number, User: UserPayload) {
    try {
      if (User.hierarquia !== 'ADM') {
        throw new HttpException(
          { message: 'Apenas administradores podem excluir imobiliárias' },
          403,
        );
      }
      const dados = await this.prismaService.imobiliaria.findUnique({
        where: { id },
      });
      if (!dados) {
        throw new HttpException({ message: 'Imobiliária não encontrada' }, 404);
      }

      // Os envelopes vinculados ficam com imobiliaria_id = null (onDelete: SetNull)
      await this.prismaService.imobiliaria.delete({ where: { id } });

      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Imobiliaria',
        Descricao: `Imobiliária Excluída por ${User.id}-${User.nome} do sistema Razão Social: ${dados.razaosocial} com o CNPJ: ${dados.cnpj} dados ${JSON.stringify(dados)} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return { message: 'Imobiliária excluída com sucesso' };
    } catch (error) {
      throw new HttpException(
        { message: error.message ? error.message : 'Erro Desconhecido' },
        error.status || 500,
      );
    }
  }

  async search(filters: any, User: UserPayload) {
    try {
      const { id, razaosocial, fantasia, cnpj, status } = filters;

      const where: any = {};
      if (User.hierarquia !== 'ADM') {
        const permitidas = await this.imobiliariasDoUsuario(User.id);
        where.id = {
          in: id ? permitidas.filter((p) => p === Number(id)) : permitidas,
        };
      } else if (id) {
        where.id = Number(id);
      }

      if (razaosocial)
        where.razaosocial = { contains: razaosocial, mode: 'insensitive' };
      if (fantasia)
        where.fantasia = { contains: fantasia, mode: 'insensitive' };
      if (cnpj) where.cnpj = { contains: cnpj.replace(/\D/g, '') };
      if (status !== 'todos' && status !== undefined) {
        where.status = status === 'ativo';
      }

      const data = await this.prismaService.imobiliaria.findMany({
        where,
        orderBy: { fantasia: 'asc' },
        select: this.listSelect,
      });

      return data.map((item) => ({
        ...item,
        colaboradores: item.colaboradores.length,
      }));
    } catch (error) {
      throw new HttpException(error.message || 'Erro na busca', 500);
    }
  }
}
