import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolutiService } from 'src/soluti/soluti.service';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { Prisma, VoucherStatus } from '@prisma/client';
import { VincularVoucherDto } from './dto/vincular-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    private prisma: PrismaService,
    private solutiService: SolutiService,
    private fcwebProvider: FcwebProvider,
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

    const whereSql = conditions.length
      ? Prisma.sql`${Prisma.join(conditions, ' ')}`
      : Prisma.empty;

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
      fcw2Id: v.fcw2Id ? Number(v.fcw2Id) : null,
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

  // --- IMPORTAÇÃO JSON ---
  async importarJson(payload: any) {
    const lista = payload?.data?.result;

    if (!lista || !Array.isArray(lista)) {
      throw new BadRequestException('JSON inválido. Esperado data.result[]');
    }

    const dadosParaInserir = lista
      .filter(
        (item: any) =>
          item && item.gvs_voucher && item.gvs_voucher.trim() !== '',
      )
      .map((item: any) => {
        return {
          codigo: item.gvs_voucher.trim(),
          produtoSoluti: item.gvs_pro_descr_prod || 'PRODUTO DESCONHECIDO',
          status: VoucherStatus.DISPONIVEL,
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

    if (!solicitacao.id_fcw) {
      throw new BadRequestException(
        `A solicitação #${dados.solicitacaoId} não possui ficha FCWEB vinculada. Gere a ficha antes de vincular o voucher.`,
      );
    }

    const clienteNome = solicitacao.nome || dados.nome;
    const clienteCpf = solicitacao.cpf || dados.cpf;

    if (!clienteNome || !clienteCpf) {
      throw new BadRequestException(
        'A solicitação encontrada não possui Nome ou CPF válidos.',
      );
    }

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

    const acaoLog =
      voucher.status === VoucherStatus.RECICLAVEL
        ? 'REPASSE_LOCAL'
        : 'VINCULO_LOCAL';

    await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        status: VoucherStatus.VINCULADO,
        solicitacao: { connect: { id: dados.solicitacaoId } },
        fcw2Id: solicitacao.id_fcw,
        clienteNome: clienteNome.toUpperCase(),
        clienteCpf: clienteCpf.replace(/\D/g, ''),
        dataVinculo: new Date(),
        codVenda: dados.solicitacaoId.toString(),
      },
    });

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

  // --- SINCRONIZAR STATUS (Manual) ---
  async sincronizarStatus(voucherId: number) {
    this.logger.log(`🔄 Iniciando sincronização manual ID: ${voucherId}`);

    let voucher = await this.prisma.voucher.findUnique({
      where: { id: voucherId },
      include: { solicitacao: true },
    });
    if (!voucher) throw new NotFoundException('Voucher não encontrado');

    this.logger.log(`📡 Consultando API Soluti: ${voucher.codigo}`);
    const rawApiData = await this.solutiService.consultarSituacao(
      voucher.codigo,
    );
    const apiData = this.parseSolutiResponse(rawApiData);

    this.logger.log(`📦 Retorno API: ${JSON.stringify(apiData)}`);

    if (
      !apiData ||
      (apiData.status !== '2' &&
        apiData.status !== '3' &&
        apiData.situacao !== '2' &&
        apiData.status !== '0')
    ) {
      return {
        status: 'error',
        msg: `Retorno API inválido ou erro: ${JSON.stringify(apiData)}`,
      };
    }

    // 1. Voucher Aberto (Não utilizado)
    if (!apiData.dataEmissao && !apiData.nomeCert) {
      const reciclado = await this.verificarReciclagem(voucher, 'MANUAL');
      if (reciclado) {
        return {
          status: 'warning',
          msg: 'Voucher não utilizado há mais de 3 dias. Reciclado para o estoque.',
        };
      }
      return { status: 'ok', msg: 'Voucher aguardando utilização.' };
    }

    // 2. Voucher Utilizado
    const cpfQuemUsou =
      apiData.cpfCert?.replace(/\D/g, '') ||
      apiData.cpfcnpjCert?.replace(/\D/g, '');
    const nomeQuemUsou = apiData.nomeCert;
    let cpfVinculado = voucher.clienteCpf?.replace(/\D/g, '');

    this.logger.log(
      `🔍 [Sync] Usou: ${cpfQuemUsou} | Vinculado: ${cpfVinculado}`,
    );

    // =====================================================================
    // LÓGICA DE AUTO-VÍNCULO (Busca Venda Pendente Válida)
    // =====================================================================
    if (
      cpfQuemUsou &&
      (!voucher.solicitacaoId || cpfQuemUsou !== cpfVinculado)
    ) {
      this.logger.log(
        `🚨 Voucher usado por CPF ${cpfQuemUsou}, mas vinculado a ${cpfVinculado || 'NINGUÉM'}. Buscando venda pendente...`,
      );

      const solicitacaoEncontrada = await this.prisma.solicitacao.findFirst({
        where: {
          cpf: { contains: cpfQuemUsou }, // Busca pelo CPF
          ativo: true, // Apenas ATIVAS
          distrato: false, // Não pode ser DISTRATO
          andamento: { not: 'EMITIDO' }, // <--- NOVA REGRA: Ignora as já emitidas
        },
        orderBy: { id: 'desc' }, // Prioriza a venda mais recente
      });

      if (solicitacaoEncontrada) {
        this.logger.log(
          `✅ Solicitação PENDENTE #${solicitacaoEncontrada.id} encontrada! Realizando auto-vínculo.`,
        );

        const voucherAtualizado = await this.prisma.voucher.update({
          where: { id: voucher.id },
          data: {
            solicitacaoId: solicitacaoEncontrada.id,
            fcw2Id: solicitacaoEncontrada.id_fcw,
            clienteNome: nomeQuemUsou,
            clienteCpf: cpfQuemUsou,
            codVenda: solicitacaoEncontrada.id.toString(),
          },
          include: { solicitacao: true },
        });

        await this.prisma.voucherLog.create({
          data: {
            voucherId: voucher.id,
            acao: 'AUTO_VINCULO',
            descricao: `Voucher usado por ${nomeQuemUsou}. Auto-vinculado à Venda Pendente #${solicitacaoEncontrada.id}.`,
          },
        });

        voucher = voucherAtualizado;
        cpfVinculado = cpfQuemUsou;
      } else {
        this.logger.warn(
          `❌ Nenhuma solicitação PENDENTE (Ativa, Sem Distrato e Não Emitida) encontrada para o CPF ${cpfQuemUsou}.`,
        );
      }
    }
    // =====================================================================

    // CASO SUCESSO: CPF Bate
    if (cpfQuemUsou && cpfVinculado && cpfQuemUsou === cpfVinculado) {
      this.logger.log(
        '✅ Match de CPF! Confirmando emissão e atualizando Venda/FCWEB...',
      );
      await this.confirmarEmissao(voucher, apiData);
      return {
        status: 'success',
        msg: 'Voucher vinculado à venda e baixado com sucesso!',
      };
    }

    // CASO CONFLITO
    if (cpfQuemUsou && cpfQuemUsou !== cpfVinculado) {
      this.logger.warn(
        '🚨 CONFLITO REAL: Usado por pessoa sem venda pendente no sistema.',
      );

      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          status: VoucherStatus.UTILIZADO,
          dataUso: new Date(),
          clienteNome: nomeQuemUsou,
          clienteCpf: cpfQuemUsou,
          solicitacaoId: null,
          fcw2Id: null,
        },
      });

      await this.prisma.voucherLog.create({
        data: {
          voucherId: voucher.id,
          acao: 'CONFLITO_USO',
          descricao: `Usado por ${nomeQuemUsou} (CPF ${cpfQuemUsou}). Sem venda pendente localizada.`,
        },
      });

      return {
        status: 'warning',
        msg: `CONFLITO: Voucher usado por ${nomeQuemUsou}. Nenhuma venda pendente encontrada para este CPF.`,
      };
    }

    return { status: 'ok', msg: 'Status verificado.' };
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

  // --- CRON JOB ---
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronVouchers() {
    this.logger.log('🔄 Iniciando CRON...');
    const vouchersVinculados = await this.prisma.voucher.findMany({
      where: { status: VoucherStatus.VINCULADO },
      select: { id: true, codigo: true },
    });

    for (const voucher of vouchersVinculados) {
      try {
        await new Promise((r) => setTimeout(r, 500));
        await this.sincronizarStatus(voucher.id);
      } catch (error) {
        this.logger.error(`Erro CRON voucher ${voucher.codigo}`, error);
      }
    }
    this.logger.log('🏁 CRON finalizado.');
  }

  // --- HELPER: CONFIRMAR EMISSÃO ---
  private async confirmarEmissao(voucher: any, apiData: any) {
    this.logger.log(
      `🛠️ Executando confirmarEmissao para Voucher ID ${voucher.id}...`,
    );

    const { dataIso, horaString } = this.parseDataSoluti(apiData.dataEmissao);

    let dataVencimento: Date;

    if (apiData.dataVencimento) {
      const vencimentoParsed = this.parseDataSoluti(apiData.dataVencimento);
      dataVencimento = vencimentoParsed.dataIso;
    } else {
      dataVencimento = new Date(dataIso);
      dataVencimento.setFullYear(dataVencimento.getFullYear() + 5);
    }

    await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        status: VoucherStatus.UTILIZADO,
        dataUso: dataIso,
      },
    });
    this.logger.log('-> Voucher atualizado para UTILIZADO.');

    if (voucher.solicitacaoId) {
      this.logger.log(
        `-> Atualizando Solicitação #${voucher.solicitacaoId}...`,
      );
      await this.prisma.solicitacao.update({
        where: { id: voucher.solicitacaoId },
        data: {
          andamento: 'EMITIDO',
          dt_aprovacao: dataIso,
          hr_aprovacao: dataIso,
        },
      });

      const idFcw = voucher.solicitacao?.id_fcw || voucher.fcw2Id;

      if (idFcw) {
        try {
          this.logger.log(`-> Atualizando FCWEB ID ${idFcw}...`);

          await this.fcwebProvider.updateFcweb(idFcw, {
            vouchersoluti: voucher.codigo,
            andamento: 'EMITIDO',
            dt_aprovacao: dataIso,
            hr_aprovacao: horaString,
            vctoCD: dataVencimento,
          });

          this.logger.log(
            `✅ FCWEB ${idFcw} atualizada (Vencimento: ${dataVencimento.toISOString()})`,
          );
        } catch (error) {
          this.logger.error(`❌ Erro ao atualizar FCWEB ${idFcw}:`, error);
        }
      }
    }

    await this.prisma.voucherLog.create({
      data: {
        voucherId: voucher.id,
        acao: 'USO_CONFIRMADO',
        descricao: `Certificado emitido em ${apiData.dataEmissao}. Vencimento: ${dataVencimento.toLocaleDateString()}.`,
      },
    });
  }

  private async verificarReciclagem(
    voucher: any,
    origem: string,
  ): Promise<boolean> {
    const dataVinculo = new Date(voucher.dataVinculo || voucher.updatedAt);
    const hoje = new Date();
    const diffTempo = Math.abs(hoje.getTime() - dataVinculo.getTime());
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

    if (diffDias >= 3) {
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          status: VoucherStatus.RECICLAVEL,
          clienteNome: null,
          clienteCpf: null,
          solicitacaoId: null,
          fcw2Id: null,
          codVenda: null,
          dataVinculo: null,
        },
      });

      await this.prisma.voucherLog.create({
        data: {
          voucherId: voucher.id,
          acao: `${origem}_RECICLAGEM`,
          descricao: `Cliente ${voucher.clienteNome} não utilizou em ${diffDias} dias. Voucher reciclado.`,
        },
      });

      this.logger.log(
        `♻️ Voucher ${voucher.codigo} reciclado por inatividade de ${diffDias} dias (${origem}).`,
      );
      return true;
    }
    return false;
  }

  private parseDataSoluti(dataStr: string) {
    try {
      if (!dataStr) return { dataIso: new Date(), horaString: '00:00:00' };

      const partes = dataStr.split(' ');
      const dataPart = partes[0];
      const horaPart = partes[1] || '00:00:00';

      const [dia, mes, ano] = dataPart.split('/');

      const isoString = `${ano}-${mes}-${dia}T${horaPart}`;
      const dateObj = new Date(isoString);

      return {
        dataIso: dateObj,
        horaString: horaPart,
      };
    } catch (e) {
      this.logger.warn(
        `Erro ao parsear data Soluti: ${dataStr}. Usando data atual.`,
      );
      const now = new Date();
      return {
        dataIso: now,
        horaString: now.toTimeString().split(' ')[0],
      };
    }
  }

  private parseSolutiResponse(rawRes: any): any {
    if (rawRes?.SituacaovoucherReturn?.$value) {
      try {
        return JSON.parse(rawRes.SituacaovoucherReturn.$value);
      } catch (e) {}
    }
    if (rawRes?.situacaovoucherReturn?.$value) {
      try {
        return JSON.parse(rawRes.situacaovoucherReturn.$value);
      } catch (e) {}
    }
    return rawRes;
  }
}
