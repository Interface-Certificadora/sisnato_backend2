import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserPayload } from 'src/auth/entities/user.entity';
import { ErrorService } from 'src/error/error.service';
import { PdfCreateService } from 'src/pdf_create/pdf_create.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IntelesignService } from '../intelesign/intelesign.service';
import { CreateRelatorioNatosignDto } from './dto/create-relatorio_natosign.dto';
import { PesquisaRelatorioNatosignDto } from './dto/pesquisa-relatorio_natosign.dto';
import { UpdateRelatorioNatosignDto } from './dto/update-relatorio_natosign.dto';

// Só envelope concluído é cobrado
const STATUS_CONCLUIDO = ['done', 'completed'];
// Estados que a Intellisign não muda mais: não precisa sincronizar
const STATUS_FINAL = [...STATUS_CONCLUIDO, 'rejected', 'expired', 'failed'];
// Envelopes sincronizados com a Intellisign ao mesmo tempo
const LOTE_SINCRONIZACAO = 5;

const clienteSelect = {
  id: true,
  fantasia: true,
  razaosocial: true,
  cnpj: true,
} as const;

const envelopeSelect = {
  id: true,
  title: true,
  original_name: true,
  createdAt: true,
  valor: true,
  empreendimento: { select: { id: true, nome: true, cidade: true } },
  contrutora: { select: { fantasia: true, razaosocial: true } },
  cca: { select: { fantasia: true, razaosocial: true } },
  user: { select: { nome: true } },
  signatarios: { select: { nome: true } },
} satisfies Prisma.IntelesignSelect;

type EnvelopeCobrado = Prisma.IntelesignGetPayload<{
  select: typeof envelopeSelect;
}>;

const brl = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const arredondar = (valor: number) => Math.round(valor * 100) / 100;

@Injectable()
export class RelatorioNatosignService {
  constructor(
    private readonly Prisma: PrismaService,
    private readonly PdfCreate: PdfCreateService,
    private readonly LogError: ErrorService,
    private readonly Intelesign: IntelesignService,
  ) {}

  /**
   * Mesma permissão da tela de cobranças de certificado (role.relatorio).
   * Lê do banco para valer sem novo login.
   */
  private async garantirAcesso(User: UserPayload) {
    if (User.hierarquia === 'ADM') return;
    const usuario = await this.Prisma.user.findUnique({
      where: { id: User.id },
      select: { role: true },
    });
    if (!(usuario?.role as Record<string, unknown>)?.relatorio) {
      throw new HttpException(
        'Você não tem permissão para acessar as cobranças do NatoSign',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private falha(error: any): never {
    if (error instanceof HttpException) throw error;
    this.LogError.Post(JSON.stringify(error, null, 2));
    throw new HttpException({ message: error.message }, 400);
  }

  /** Datas no fuso de Brasília, com o dia final inteiro. */
  private periodo(Inicio: string, Fim?: string): Prisma.DateTimeFilter {
    return {
      gte: new Date(`${Inicio}T00:00:00-03:00`),
      ...(Fim && { lte: new Date(`${Fim}T23:59:59.999-03:00`) }),
    };
  }

  /**
   * O status do envelope só é atualizado quando alguém o abre. Antes de
   * cobrar, busca na Intellisign os que ainda não estão num estado final.
   */
  private async sincronizarStatus(where: Prisma.IntelesignWhereInput) {
    const abertos = await this.Prisma.intelesign.findMany({
      where: {
        ...where,
        UUID: { not: null },
        OR: [{ status: null }, { status: { notIn: STATUS_FINAL } }],
      },
      select: { id: true },
    });
    for (let i = 0; i < abertos.length; i += LOTE_SINCRONIZACAO) {
      await Promise.allSettled(
        abertos
          .slice(i, i + LOTE_SINCRONIZACAO)
          .map((envelope) => this.Intelesign.findOneStatus(envelope.id)),
      );
    }
  }

  private agruparPorEmpreendimento(envelopes: EnvelopeCobrado[]) {
    const grupos = new Map<number, EnvelopeCobrado[]>();
    for (const envelope of envelopes) {
      const id = envelope.empreendimento?.id ?? 0;
      grupos.set(id, [...(grupos.get(id) || []), envelope]);
    }

    return Array.from(grupos.entries()).map(([id, lista]) => {
      const valor = arredondar(
        lista.reduce((acc, envelope) => acc + (envelope.valor ?? 0), 0),
      );
      return {
        id,
        nome: lista[0].empreendimento?.nome || 'Sem empreendimento',
        cidade: lista[0].empreendimento?.cidade || '',
        total: lista.length,
        valorNumero: valor,
        valor: brl(valor),
        envelopes: lista.map((envelope) => ({
          id: envelope.id,
          title: envelope.title,
          original_name: envelope.original_name,
          createdAt: envelope.createdAt.toISOString(),
          valor: envelope.valor ?? 0,
          construtora:
            envelope.contrutora?.fantasia ||
            envelope.contrutora?.razaosocial ||
            '',
          cca: envelope.cca?.fantasia || envelope.cca?.razaosocial || '',
          solicitante: envelope.user?.nome || '',
          signatarios: envelope.signatarios.map((s) => s.nome).join('; '),
        })),
      };
    });
  }

  async create(data: CreateRelatorioNatosignDto, User: UserPayload) {
    try {
      await this.garantirAcesso(User);
      const { ConstrutoraId, FinanceiroId, Inicio, Fim } = data;

      if (!!ConstrutoraId === !!FinanceiroId) {
        throw new HttpException(
          'Informe a construtora ou a CCA (apenas uma das duas)',
          400,
        );
      }

      const cliente = ConstrutoraId
        ? await this.Prisma.construtora.findUnique({
            where: { id: ConstrutoraId },
            select: { id: true },
          })
        : await this.Prisma.financeiro.findUnique({
            where: { id: FinanceiroId },
            select: { id: true },
          });
      if (!cliente) {
        throw new HttpException(
          ConstrutoraId ? 'Construtora não encontrada' : 'CCA não encontrada',
          404,
        );
      }

      const where: Prisma.IntelesignWhereInput = {
        ativo: true,
        cancelado_em: null,
        createdAt: this.periodo(Inicio, Fim),
        ...(ConstrutoraId
          ? { construtora_id: ConstrutoraId }
          : { cca_id: FinanceiroId }),
      };

      await this.sincronizarStatus(where);

      const envelopes = await this.Prisma.intelesign.findMany({
        where: {
          ...where,
          status: { in: STATUS_CONCLUIDO },
          status_pg: 'pending',
          relatorio_natosign_id: null,
        },
        select: envelopeSelect,
        orderBy: { createdAt: 'asc' },
      });

      if (envelopes.length === 0) {
        throw new HttpException(
          'Nenhum envelope concluído pendente de cobrança nesse período',
          400,
        );
      }

      const empreendimentos = this.agruparPorEmpreendimento(envelopes);
      const valorTotal = arredondar(
        empreendimentos.reduce((acc, emp) => acc + emp.valorNumero, 0),
      );
      // Prefixo NS evita colisão com os protocolos de certificado no S3
      const protocolo =
        'NS' + new Date().toISOString().split('.')[0].replace(/\D/g, '');
      const ids = envelopes.map((envelope) => envelope.id);

      const relatorio = await this.Prisma.$transaction(async (tx) => {
        const novo = await tx.relatorio_natosign.create({
          data: {
            protocolo,
            construtoraId: ConstrutoraId ?? null,
            financeiroId: FinanceiroId ?? null,
            start: new Date(Inicio),
            end: Fim ? new Date(Fim) : null,
            total_envelopes: envelopes.length,
            valorTotal,
            empreendimentos,
          },
        });

        // Trava contra dois relatórios gerados ao mesmo tempo
        const marcados = await tx.intelesign.updateMany({
          where: {
            id: { in: ids },
            status_pg: 'pending',
            relatorio_natosign_id: null,
          },
          data: { status_pg: 'billed', relatorio_natosign_id: novo.id },
        });
        if (marcados.count !== ids.length) {
          throw new HttpException(
            'Alguns envelopes acabaram de entrar em outra cobrança. Gere o relatório novamente.',
            409,
          );
        }
        return novo;
      });

      return {
        message: 'Relatório criado com sucesso',
        id: relatorio.id,
        protocolo: relatorio.protocolo,
        total_envelopes: relatorio.total_envelopes,
        valorTotal: relatorio.valorTotal,
      };
    } catch (error) {
      this.falha(error);
    }
  }

  private async buscarParaArquivo(protocolo: string) {
    const relatorio = await this.Prisma.relatorio_natosign.findUnique({
      where: { protocolo },
      include: { construtora: true, financeiro: true },
    });
    if (!relatorio) {
      throw new HttpException('Relatório não encontrado', 404);
    }
    const cliente = relatorio.construtora ?? relatorio.financeiro;
    if (!cliente) {
      throw new HttpException('Relatório sem cliente vinculado', 400);
    }
    return { relatorio, cliente };
  }

  async relatorioPdf(protocolo: string, User: UserPayload) {
    await this.garantirAcesso(User);
    const { relatorio, cliente } = await this.buscarParaArquivo(protocolo);
    if (relatorio.pdf) return relatorio.pdf;

    const { fileName } = await this.PdfCreate.GerarRelatorioPdf(
      protocolo,
      cliente,
      relatorio.valorTotal,
      relatorio.empreendimentos as any,
    );
    await this.Prisma.relatorio_natosign.update({
      where: { protocolo },
      data: { pdf: fileName },
    });
    return fileName;
  }

  async relatorioXlsx(protocolo: string, User: UserPayload) {
    await this.garantirAcesso(User);
    const { relatorio, cliente } = await this.buscarParaArquivo(protocolo);
    if (relatorio.xlsx) return relatorio.xlsx;

    const fileName = await this.PdfCreate.createXlsxNatosign(
      cliente,
      relatorio.valorTotal,
      relatorio.total_envelopes,
      protocolo,
      relatorio.empreendimentos as any,
    );
    await this.Prisma.relatorio_natosign.update({
      where: { protocolo },
      data: { xlsx: fileName },
    });
    return fileName;
  }

  async findAll(User: UserPayload) {
    try {
      await this.garantirAcesso(User);
      return await this.Prisma.relatorio_natosign.findMany({
        where: { status: true },
        orderBy: [{ situacao_pg: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          protocolo: true,
          valorTotal: true,
          total_envelopes: true,
          dt_pg: true,
          situacao_pg: true,
          nota_fiscal: true,
          start: true,
          end: true,
          pdf: true,
          xlsx: true,
          createdAt: true,
          construtora: { select: clienteSelect },
          financeiro: { select: clienteSelect },
        },
        take: 100,
      });
    } catch (error) {
      this.falha(error);
    }
  }

  async findOne(id: number, User: UserPayload) {
    try {
      await this.garantirAcesso(User);
      const relatorio = await this.Prisma.relatorio_natosign.findUnique({
        where: { id },
        include: {
          construtora: { select: clienteSelect },
          financeiro: { select: clienteSelect },
        },
      });
      if (!relatorio) {
        throw new HttpException('Relatório não encontrado', 404);
      }
      return relatorio;
    } catch (error) {
      this.falha(error);
    }
  }

  /**
   * Ao mudar a situação, os envelopes acompanham:
   * pago (2) => 'paid'; em análise/pendente => 'billed'.
   */
  async update(
    id: number,
    data: UpdateRelatorioNatosignDto,
    User: UserPayload,
  ) {
    try {
      await this.garantirAcesso(User);
      const atual = await this.Prisma.relatorio_natosign.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!atual?.status) {
        throw new HttpException('Relatório não encontrado', 404);
      }

      const pago = data.situacao_pg === 2;
      return await this.Prisma.$transaction(async (tx) => {
        const relatorio = await tx.relatorio_natosign.update({
          where: { id },
          data: {
            ...data,
            ...(pago && !data.dt_pg && { dt_pg: new Date() }),
            ...(data.situacao_pg !== undefined && !pago && { dt_pg: null }),
          },
        });
        if (data.situacao_pg !== undefined) {
          await tx.intelesign.updateMany({
            where: { relatorio_natosign_id: id },
            data: { status_pg: pago ? 'paid' : 'billed' },
          });
        }
        return relatorio;
      });
    } catch (error) {
      this.falha(error);
    }
  }

  /** Exclui o relatório e devolve os envelopes para a fila de cobrança. */
  async remove(id: number, User: UserPayload) {
    try {
      await this.garantirAcesso(User);
      const relatorio = await this.Prisma.relatorio_natosign.findUnique({
        where: { id },
        select: { status: true, situacao_pg: true },
      });
      if (!relatorio) {
        throw new HttpException('Relatório não encontrado', 404);
      }
      if (!relatorio.status) {
        throw new HttpException('Relatório já excluído', 400);
      }
      if (relatorio.situacao_pg === 2) {
        throw new HttpException('Relatório já pago não pode ser excluído', 400);
      }

      await this.Prisma.$transaction([
        this.Prisma.intelesign.updateMany({
          where: { relatorio_natosign_id: id },
          data: { status_pg: 'pending', relatorio_natosign_id: null },
        }),
        this.Prisma.relatorio_natosign.update({
          where: { id },
          data: { status: false },
        }),
      ]);
      return { message: 'Relatório excluído com sucesso' };
    } catch (error) {
      this.falha(error);
    }
  }

  async pesquisa(data: PesquisaRelatorioNatosignDto, User: UserPayload) {
    try {
      await this.garantirAcesso(User);
      const termo = data.pesquisa.trim();
      const numeros = termo.replace(/\D/g, '');

      const filtroCliente: Prisma.ConstrutoraWhereInput &
        Prisma.FinanceiroWhereInput =
        numeros.length === 14
          ? { cnpj: numeros }
          : {
              OR: [
                { razaosocial: { contains: termo, mode: 'insensitive' } },
                { fantasia: { contains: termo, mode: 'insensitive' } },
              ],
            };

      const relatorios = await this.Prisma.relatorio_natosign.findMany({
        where: {
          status: true,
          OR: [
            { protocolo: { contains: termo } },
            { construtora: filtroCliente },
            { financeiro: filtroCliente },
          ],
        },
        orderBy: [{ situacao_pg: 'asc' }, { createdAt: 'desc' }],
        include: {
          construtora: { select: clienteSelect },
          financeiro: { select: clienteSelect },
        },
      });
      if (relatorios.length < 1) {
        throw new HttpException(
          'Não tem cobranças registradas para essa consulta',
          404,
        );
      }
      return relatorios;
    } catch (error) {
      this.falha(error);
    }
  }

  async relatorioGeral(User: UserPayload) {
    try {
      await this.garantirAcesso(User);
      const base = { status: true };
      const [relatorios, emAberto, aprovado, pendente, em_analise, aCobrar] =
        await Promise.all([
          this.Prisma.relatorio_natosign.count({ where: base }),
          this.Prisma.relatorio_natosign.aggregate({
            where: { ...base, situacao_pg: { not: 2 } },
            _sum: { valorTotal: true },
          }),
          this.Prisma.relatorio_natosign.count({
            where: { ...base, situacao_pg: 2 },
          }),
          this.Prisma.relatorio_natosign.count({
            where: { ...base, situacao_pg: 1 },
          }),
          this.Prisma.relatorio_natosign.count({
            where: { ...base, situacao_pg: 0 },
          }),
          // Status do banco: pode não contar os que ninguém abriu desde a conclusão
          this.Prisma.intelesign.aggregate({
            where: {
              ativo: true,
              cancelado_em: null,
              status: { in: STATUS_CONCLUIDO },
              status_pg: 'pending',
              relatorio_natosign_id: null,
            },
            _count: { id: true },
            _sum: { valor: true },
          }),
        ]);

      return {
        relatorios,
        cobrancas_aberto: brl(emAberto._sum.valorTotal ?? 0),
        aprovado,
        pendente,
        em_analise,
        envelopes_a_cobrar: aCobrar._count.id,
        valor_a_cobrar: brl(aCobrar._sum.valor ?? 0),
      };
    } catch (error) {
      this.falha(error);
    }
  }
}
