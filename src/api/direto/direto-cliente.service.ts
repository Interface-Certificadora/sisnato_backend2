import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PixService } from '../pix/pix.service';
import { lerDiretoLinkToken } from './direto-link-token';
import { PIX_EXPIRACAO_SEGUNDOS } from './direto.service';

const somenteDigitos = (v: string) => (v ?? '').replace(/\D/g, '');

/** Fluxo público do cliente: acesso pelo token criptografado + CPF. */
@Injectable()
export class DiretoClienteService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pixService: PixService,
  ) {}

  async inicio(token: string) {
    await this.carregar(token);
    return { valido: true };
  }

  async validarCpf(token: string, cpf: string) {
    const sol = await this.carregar(token, cpf);
    const { pago } = await this.situacao(sol);
    return {
      pago,
      dados: { nome: sol.nome, cpf: sol.cpf, telefone: sol.telefone },
    };
  }

  async status(token: string, cpf: string) {
    const sol = await this.carregar(token, cpf);
    const { pago } = await this.situacao(sol);
    return { pago };
  }

  async cobranca(token: string, cpf: string) {
    const sol = await this.carregar(token, cpf);
    const { pago, expirada, expiraEm } = await this.situacao(sol);
    if (pago) return { pago: true };

    if (!expirada) {
      return {
        pago: false,
        pixCopiaECola: sol.pixCopiaECola,
        imagemQrcode: sol.imagemQrcode,
        valor: sol.valorcd,
        expiraEm,
      };
    }

    // Cobrança expirada e não paga: gera uma nova e substitui na solicitação.
    const pix = await this.pixService.create(
      {
        cpf: somenteDigitos(sol.cpf),
        nome: sol.nome,
        valor: sol.valorcd.toFixed(2),
      },
      PIX_EXPIRACAO_SEGUNDOS,
    );
    // Só troca se ninguém regerou antes (chamadas simultâneas).
    const { count } = await this.prismaService.solicitacao.updateMany({
      where: { id: sol.id, txid: sol.txid },
      data: {
        txid: pix.txid,
        pixCopiaECola: pix.pixCopiaECola,
        imagemQrcode: pix.imagemQrcode,
      },
    });
    const atual =
      count > 0
        ? pix
        : await this.prismaService.solicitacao.findUnique({
            where: { id: sol.id },
          });
    return {
      pago: false,
      pixCopiaECola: atual.pixCopiaECola,
      imagemQrcode: atual.imagemQrcode,
      valor: sol.valorcd,
      expiraEm: new Date(Date.now() + PIX_EXPIRACAO_SEGUNDOS * 1000),
    };
  }

  /** Valida o token (e o CPF, quando informado) e carrega a solicitação. */
  private async carregar(token: string, cpf?: string) {
    const payload = lerDiretoLinkToken(token);
    const sol = await this.prismaService.solicitacao.findFirst({
      where: { id: payload.solicitacaoId, direto: true },
      select: {
        id: true,
        nome: true,
        cpf: true,
        telefone: true,
        valorcd: true,
        txid: true,
        pixCopiaECola: true,
        imagemQrcode: true,
        pg_status: true,
      },
    });
    if (!sol || somenteDigitos(sol.cpf) !== payload.cpf) {
      throw new HttpException('Link inválido ou expirado.', 400);
    }
    if (cpf !== undefined && somenteDigitos(cpf) !== payload.cpf) {
      throw new HttpException('CPF não confere com o cadastro.', 403);
    }
    return sol;
  }

  /** Confirma o pagamento na Efí (que também atualiza a solicitação). */
  private async situacao(sol: {
    txid: string | null;
    pg_status: boolean | null;
  }) {
    if (sol.pg_status) return { pago: true, expirada: false, expiraEm: null };
    if (!sol.txid) return { pago: false, expirada: true, expiraEm: null };

    const detalhe: any = await this.pixService.PixPaymentStatus(sol.txid);
    if (detalhe.status === 'CONCLUIDA') {
      return { pago: true, expirada: false, expiraEm: null };
    }
    const criacao = new Date(detalhe.calendario?.criacao).getTime();
    const expiraEm = new Date(
      criacao + (detalhe.calendario?.expiracao ?? 0) * 1000,
    );
    const expirada =
      detalhe.status !== 'ATIVA' ||
      isNaN(expiraEm.getTime()) ||
      expiraEm < new Date();
    return { pago: false, expirada, expiraEm };
  }
}
