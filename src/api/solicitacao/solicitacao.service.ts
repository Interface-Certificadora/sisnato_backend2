import { HttpException, Injectable } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { ErrorEntity } from 'src/entities/error.entity';
import { filterSolicitacaoDto } from './dto/filter-solicitacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolicitacaoProperty } from './entities/solicitacao.propety.entity';
import { SolicitacaoAll } from './entities/solicitacao.all.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SolicitacaoService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSolicitacaoDto, sms: string, user: any) {
    try {
      const retorno = this.prisma.solicitacao.create({
        data: {
          ...data,
          ativo: true,
          corretor: { connect: { id: user.id } },
          financeiro: { connect: { id: data.financeiro } },
          construtora: { connect: { id: data.construtora } },
          empreendimento: { connect: { id: data.empreendimento } },
        },
        include: {
          corretor: {
            select: {
              id: true,
              nome: true,
              telefone: true,
            },
          },
          financeiro: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          construtora: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
              cidade: true,
            },
          },
        },
      });
      const construtora: any = retorno.construtora;
      const financeira: any = retorno.financeiro;
      const empreendimento: any = retorno.empreendimento;
      
      const Msg = `Ola *${data.nome}*, tudo bem?!\n\nSomos a *Interface Certificadora*, e à pedido da construtora ${construtora?.fantasia} estamos entrando em contato referente ao seu novo empreendimento${empreendimento?.cidade ? `, em *${empreendimento?.cidade}*` : ''}.\nPrecisamos fazer o seu certificado digital para que você possa assinar os documentos do seu financiamento imobiliário junto a CAIXA e Correspondente bancário ${financeira?.fantasia}, e assim prosseguir para a próxima etapa.\n\nPara mais informações, responda essa mensagem, ou aguarde segundo contato.`;

      
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async findAll(
    pagina: number,
    limite: number,
    filtro: filterSolicitacaoDto,
    UserData: any,
  ): Promise<SolicitacaoProperty> {
    try {
      const { nome, id, andamento, construtora, empreendimento, financeiro } =
        filtro;
      const PaginaAtual = pagina || 1;
      const Limite = !!andamento ? 50 : limite ? limite : 20;
      const Offset = (PaginaAtual - 1) * Limite;
      const Ids = UserData.Financeira;
      const ConstId = UserData.construtora;
      const EmpId = UserData.empreendimento;

      const FilterWhere = {
        ...(UserData.hierarquia === 'USER' && {
          corretor: UserData.id,
          ativo: true,
          distrato: false,
        }),
        ...(UserData.hierarquia === 'CONST' && {
          construtoras: { some: { id: { in: ConstId } } },
        }),
        ...(UserData.hierarquia === 'GRT' && {
          financeiros: { some: { id: { in: Ids } } },
          ativo: true,
          construtoras: { some: { id: { in: ConstId } } },
          empreendimentos: { some: { id: { in: EmpId } } },
        }),
        ...(UserData.hierarquia === 'CCA' && {
          financeiroId: { in: Ids },
          ativo: true,
          ...(ConstId.length > 0 && {
            construtoras: { some: { id: { in: ConstId } } },
          }),
          ...(EmpId.length > 0 && {
            empreendimentos: { some: { id: { in: EmpId } } },
          }),
        }),
        ...(nome && { nome: { contains: nome } }),
        ...(id && { id: id }),
        ...(construtora > 0 && {
          construtoras: { some: { id: construtora } },
        }),
        ...(empreendimento > 0 && {
          empreendimentos: { some: { id: empreendimento } },
        }),
        ...(financeiro && { financeiros: { some: { id: financeiro } } }),
        ...(andamento && {
          andamento: { equals: andamento === 'VAZIO' ? null : andamento },
        }),
      };

      const count = await this.prisma.solicitacao.count({
        where: FilterWhere,
      });

      const req = await this.prisma.solicitacao.findMany({
        where: FilterWhere,
        orderBy: {
          id: 'desc',
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          alerts: true,
          distrato: true,
          dt_agendamento: true,
          hr_agendamento: true,
          dt_aprovacao: true,
          hr_aprovacao: true,
          type_validacao: true,
          alertanow: true,
          statusAtendimento: true,
          pause: true,
          andamento: true,
          financeiro: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          construtora: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        skip: Offset,
        take: Limite,
      });
      return {
        total: count,
        data: req.map((item) => plainToClass(SolicitacaoAll, item)),
        pagina: PaginaAtual,
        limite: Limite,
      };
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitacao`;
  }

  update(id: number, updateSolicitacaoDto: UpdateSolicitacaoDto) {
    return `This action updates a #${id} solicitacao`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitacao`;
  }
}
