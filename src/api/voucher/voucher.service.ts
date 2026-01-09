import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolutiService } from 'src/soluti/soluti.service';
import { Prisma, VoucherStatus } from '@prisma/client';
import { VincularVoucherDto } from './dto/vincular-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    private prisma: PrismaService,
    private solutiService: SolutiService,
  ) {}

  // --- LISTAGEM ---
  async findAll(filtro: QueryVoucherDto) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;
    const skip = (pagina - 1) * limite;

    const whereStandard: any = {};
    if (filtro.status) whereStandard.status = filtro.status;
    if (filtro.codigo) whereStandard.codigo = { contains: filtro.codigo };
    if (filtro.cliente) {
      whereStandard.OR = [
        { clienteNome: { contains: filtro.cliente, mode: 'insensitive' } },
        { clienteCpf: { contains: filtro.cliente } },
      ];
    }

    const total = await this.prisma.voucher.count({ where: whereStandard });

    const conditions: Prisma.Sql[] = [];

    if (filtro.status) {
      conditions.push(Prisma.sql`AND "status"::text = ${filtro.status}`);
    }
    if (filtro.codigo) {
      conditions.push(
        Prisma.sql`AND "codigo" ILIKE ${'%' + filtro.codigo + '%'}`,
      );
    }
    if (filtro.cliente) {
      const termo = '%' + filtro.cliente + '%';
      conditions.push(
        Prisma.sql`AND ("clienteNome" ILIKE ${termo} OR "clienteCpf" ILIKE ${termo})`,
      );
    }

    // Junta as condições
    const whereSql = conditions.length
      ? Prisma.sql`${Prisma.join(conditions, ' ')}`
      : Prisma.empty;

    // 1=Vinculado, 2=Reciclavel, 3=Disponivel, 4=Outros
    const vouchers = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "Voucher"
      WHERE 1=1 
      ${whereSql}
      ORDER BY 
        CASE "status"
          WHEN 'VINCULADO' THEN 1
          WHEN 'RECICLAVEL' THEN 2
          WHEN 'DISPONIVEL' THEN 3
          ELSE 4
        END ASC,
        "updatedAt" DESC
      LIMIT ${limite} OFFSET ${skip}
    `;

    const formattedVouchers = vouchers.map((v) => ({
      ...v,
      id: Number(v.id),
      solicitacaoId: v.solicitacaoId ? Number(v.solicitacaoId) : null,
    }));

    return {
      data: formattedVouchers,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  // --- IMPORTAÇÃO JSON (Carga de Estoque) ---
  async importarJson(payload: any) {
    const lista = payload?.data?.result;

    if (!lista || !Array.isArray(lista)) {
      throw new BadRequestException('JSON inválido. Esperado data.result[]');
    }

    // Filtra e prepara para salvar como DISPONIVEL
    const dadosParaInserir = lista
      .filter(
        (item: any) =>
          item && item.gvs_voucher && item.gvs_voucher.trim() !== '',
      )
      .map((item: any) => {
        return {
          codigo: item.gvs_voucher.trim(),
          produtoSoluti: item.gvs_pro_descr_prod || 'PRODUTO DESCONHECIDO',
          status: VoucherStatus.DISPONIVEL, // Vai pro estoque local
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    if (dadosParaInserir.length === 0) {
      return { message: 'Nenhum voucher válido encontrado no JSON.' };
    }

    const resultado = await this.prisma.voucher.createMany({
      data: dadosParaInserir,
      skipDuplicates: true,
    });

    return {
      status: 'success',
      total_processado: dadosParaInserir.length,
      novos_inseridos: resultado.count,
      mensagem: `${resultado.count} vouchers carregados no estoque local.`,
    };
  }

  // --- VINCULAR VOUCHER ---
  async vincularVoucher(dados: VincularVoucherDto) {
    const solicitacao = await this.prisma.solicitacao.findUnique({
      where: { id: dados.solicitacaoId },
    });

    if (!solicitacao) {
      throw new BadRequestException(
        `Solicitação #${dados.solicitacaoId} não encontrada.`,
      );
    }

    const clienteNome = solicitacao.nome || dados.nome;
    const clienteCpf = solicitacao.cpf || dados.cpf;

    if (!clienteNome || !clienteCpf) {
      throw new BadRequestException(
        'A solicitação encontrada não possui Nome ou CPF válidos.',
      );
    }

    // 2. Busca voucher no estoque local (Prioriza Reciclável)
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        status: { in: [VoucherStatus.RECICLAVEL, VoucherStatus.DISPONIVEL] },
      },
      orderBy: { status: 'desc' },
    });

    if (!voucher) {
      this.logger.warn(
        `Tentativa de vínculo sem estoque para solicitação: ${dados.solicitacaoId}`,
      );
      throw new BadRequestException(
        'Sem estoque de vouchers. Realize a importação.',
      );
    }

    // 3. Realiza o Vínculo
    const acaoLog =
      voucher.status === VoucherStatus.RECICLAVEL
        ? 'REPASSE_LOCAL'
        : 'VINCULO_LOCAL';

    await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        status: VoucherStatus.VINCULADO,
        solicitacao: { connect: { id: dados.solicitacaoId } },
        fcw2Id: dados.fcw2Id || null,
        clienteNome: clienteNome.toUpperCase(),
        clienteCpf: clienteCpf.replace(/\D/g, ''),
        dataVinculo: new Date(),
        codVenda: dados.solicitacaoId.toString(),
      },
    });

    // Registra o Log
    await this.prisma.voucherLog.create({
      data: {
        voucherId: voucher.id,
        acao: acaoLog,
        descricao: `Vinculado via ID #${dados.solicitacaoId} a ${clienteNome}`,
        usuarioId: dados.usuarioId,
      },
    });

    return {
      success: true,
      voucher: voucher.codigo,
      origem:
        acaoLog === 'REPASSE_LOCAL' ? 'ESTOQUE_RECICLADO' : 'ESTOQUE_NOVO',
      cliente: clienteNome,
    };
  }
  // --- SINCRONIZAR STATUS (O Juiz da Verdade) ---
  async sincronizarStatus(voucherId: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id: voucherId },
    });
    if (!voucher) throw new NotFoundException('Voucher não encontrado');

    // Consulta na Soluti se o voucher foi usado
    const rawApiData = await this.solutiService.consultarSituacao(
      voucher.codigo,
    );

    // Parseia resposta
    let apiData = rawApiData;
    console.log('🚀 ~ VoucherService ~ sincronizarStatus ~ apiData:', apiData);
    // ... (Lógica de parse mantida igual, pois é robusta) ...
    if (rawApiData?.SituacaovoucherReturn?.$value) {
      try {
        apiData = JSON.parse(rawApiData.SituacaovoucherReturn.$value);
      } catch (e) {}
    } else if (rawApiData?.situacaovoucherReturn?.$value) {
      try {
        apiData = JSON.parse(rawApiData.situacaovoucherReturn.$value);
      } catch (e) {}
    }

    // Verifica se houve erro na consulta
    if (
      !apiData ||
      (apiData.status !== '2' &&
        apiData.status !== '3' &&
        apiData.situacao !== '2' &&
        apiData.status !== '0')
    ) {
      // Status 0 as vezes é sucesso dependendo do método, mas aqui focamos na 'situacao'
      // Se não tiver info clara, retorna erro
      return {
        status: 'error',
        msg: `Retorno API inválido ou erro: ${JSON.stringify(apiData)}`,
      };
    }

    // --- LÓGICA DE COMPARAÇÃO ---

    // 1. Voucher ainda está Aberto/Disponível na Soluti?
    // Situacao 2 = Disponível / Status 0 = Sucesso na consulta
    // Se não tiver data de emissão ou nomeCert preenchido, é porque não foi usado.
    if (!apiData.dataEmissao && !apiData.nomeCert) {
      return { status: 'ok', msg: 'Voucher aguardando utilização.' };
    }

    // 2. Voucher FOI UTILIZADO (Tem dados de certificado)
    // Agora comparamos quem usou (Soluti) com quem deveria usar (Nosso Banco)

    const cpfQuemUsou =
      apiData.cpfCert?.replace(/\D/g, '') ||
      apiData.cpfcnpjCert?.replace(/\D/g, '');
    const nomeQuemUsou = apiData.nomeCert;
    const cpfVinculado = voucher.clienteCpf?.replace(/\D/g, '');

    // Se já estava baixado, só confirma
    if (voucher.status === VoucherStatus.UTILIZADO) {
      return { status: 'ok', msg: 'Voucher já consta como utilizado.' };
    }

    // CASO SUCESSO: CPF Bate
    if (cpfQuemUsou && cpfVinculado && cpfQuemUsou === cpfVinculado) {
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: VoucherStatus.UTILIZADO, dataUso: new Date() }, // Vira Vermelho
      });
      await this.prisma.voucherLog.create({
        data: {
          voucherId: voucher.id,
          acao: 'USO_CONFIRMADO',
          descricao: 'Uso validado na Soluti.',
        },
      });
      return { status: 'success', msg: 'Certificado emitido corretamente!' };
    }

    // CASO CONFLITO: CPF Não Bate (Outra pessoa usou nosso voucher!)
    if (cpfQuemUsou && cpfQuemUsou !== cpfVinculado) {
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          status: VoucherStatus.UTILIZADO, // Queimou o voucher
          dataUso: new Date(),
          // Atualizamos o banco para refletir a realidade
          clienteNome: nomeQuemUsou,
          clienteCpf: cpfQuemUsou,
          // Removemos o vínculo com a solicitação original, pois ela terá que receber outro voucher
          solicitacaoId: null,
          fcw2Id: null,
        },
      });

      await this.prisma.voucherLog.create({
        data: {
          voucherId: voucher.id,
          acao: 'CONFLITO_USO',
          descricao: `ALERTA: Usado na AR por ${nomeQuemUsou} (CPF ${cpfQuemUsou}). O cliente original era ${voucher.clienteNome}.`,
        },
      });

      return {
        status: 'warning',
        msg: `CONFLITO: Voucher utilizado por outra pessoa (${nomeQuemUsou}). Vínculo atual desfeito.`,
      };
    }

    return { status: 'ok', msg: 'Status verificado.' };
  }

  //Helper JSON Parsing
  private parseSolutiResponse(rawRes: any): any {
    if (rawRes.status && rawRes.voucher) return rawRes;
    if (rawRes?.GetvoucherReturn?.$value) {
      try {
        return JSON.parse(rawRes.GetvoucherReturn.$value);
      } catch (e) {}
    }
    if (
      rawRes?.GetvoucherReturn &&
      typeof rawRes.GetvoucherReturn === 'string'
    ) {
      try {
        return JSON.parse(rawRes.GetvoucherReturn);
      } catch (e) {}
    }
    return rawRes;
  }

  async getStats() {
    const groups = await this.prisma.voucher.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const stats = {
      total: 0,
      disponivel: 0,
      vinculado: 0,
      utilizado: 0,
      reciclavel: 0,
    };

    groups.forEach((g) => {
      const count = g._count.status;
      stats.total += count;

      switch (g.status) {
        case VoucherStatus.DISPONIVEL:
          stats.disponivel = count;
          break;
        case VoucherStatus.VINCULADO:
          stats.vinculado = count;
          break;
        case VoucherStatus.UTILIZADO:
          stats.utilizado = count;
          break;
        case VoucherStatus.RECICLAVEL:
          stats.reciclavel = count;
          break;
      }
    });

    return stats;
  }
}
