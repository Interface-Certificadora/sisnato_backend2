import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRelatorioFinanceiroDto } from './dto/create-relatorio_financeiro.dto';
import { CreateRelatorioDto } from './dto/relatorio.tdo';
import { UpdateRelatorioFinanceiroDto } from './dto/update-relatorio_financeiro.dto';

@Injectable()
export class RelatorioFinanceiroService {
  constructor(private Prisma: PrismaService) {}

  create(createRelatorioFinanceiroDto: CreateRelatorioFinanceiroDto) {
    return 'This action adds a new relatorioFinanceiro';
  }

  findAll() {
    return `This action returns all relatorioFinanceiro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} relatorioFinanceiro`;
  }

  update(
    id: number,
    updateRelatorioFinanceiroDto: UpdateRelatorioFinanceiroDto,
  ) {
    return `This action updates a #${id} relatorioFinanceiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} relatorioFinanceiro`;
  }

  async RelatorioFinanceiro(data: CreateRelatorioDto) {
    const { ConstrutoraId, EmpreendimentoId, Inicio, Fim, SituacaoId } = data;

    const relatorio = await this.Prisma.solicitacao.findMany({
      where: {
        construtoraId: ConstrutoraId,
        situacao_pg: SituacaoId,
        ...(EmpreendimentoId && { empreendimentoId: EmpreendimentoId }),
        ...(Fim
          ? {
              createdAt: {
                gte: new Date(Inicio),
                lte: new Date(Fim),
              },
            }
          : {
              createdAt: {
                gte: new Date(Inicio),
              },
            }
          ),
          andamento: {
            in: ['APROVADO', 'EMITIDO', 'REVOGADO'],
          },
          dt_aprovacao: {
            not: null,
          },
      },
    });



    return relatorio;
  }
}
