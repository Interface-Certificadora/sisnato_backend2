import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatCliente, ChatDispositivo } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CHAT_TOKEN_VALIDADE_MS,
  LimiteTentativas,
  cpfComMascara,
  cpfValido,
  gerarToken,
  hashToken,
  somenteDigitos,
  telefoneLocal,
} from './chat.util';

type SolicitacaoResumo = {
  id: number;
  nome: string;
  cpf: string;
  email: string | null;
};

export type DispositivoComCliente = ChatDispositivo & { cliente: ChatCliente };

export type InfoRequisicao = { ip: string | null; userAgent: string | null };

/**
 * Identificação do cliente do webchat.
 *
 * - token válido no navegador para o mesmo telefone → entra direto
 * - sem token e sem histórico → token NÃO VERIFICADO
 * - sem token e com histórico (ou telefone com mais de um CPF) → pede o CPF
 *
 * O cliente precisa existir na tabela Solicitacao.
 */
@Injectable()
export class ChatAcessoService {
  private readonly limiteIp = new LimiteTentativas(10, 15 * 60 * 1000);
  private readonly limiteTelefone = new LimiteTentativas(5, 15 * 60 * 1000);

  constructor(private readonly prisma: PrismaService) {}

  async acessar(
    telefone: string,
    token: string | undefined,
    info: InfoRequisicao,
  ) {
    const local = telefoneLocal(telefone);
    if (!local) throw new BadRequestException('Telefone inválido');

    if (token) {
      const dispositivo = await this.validarToken(token);
      if (dispositivo && dispositivo.cliente.telefone === `55${local}`) {
        return this.sessao(dispositivo);
      }
    }

    const solicitacoes = await this.solicitacoesPorTelefone(local);
    if (!solicitacoes.length) {
      throw new NotFoundException('Telefone não encontrado');
    }

    const cpfs = [...new Set(solicitacoes.map((s) => somenteDigitos(s.cpf)))];
    if (cpfs.length !== 1 || (await this.temHistorico(cpfs))) {
      return { etapa: 'CPF' as const };
    }

    const cliente = await this.vincularCliente(cpfs[0], local, solicitacoes);
    const novo = await this.criarDispositivo(cliente.id, false, info);
    return this.sessao(novo.dispositivo, novo.token);
  }

  async acessarComCpf(telefone: string, cpf: string, info: InfoRequisicao) {
    const local = telefoneLocal(telefone);
    const cpfLimpo = cpfValido(cpf);
    if (!local || !cpfLimpo) {
      throw new BadRequestException('Telefone ou CPF inválido');
    }

    const chaveIp = `ip:${info.ip}`;
    const chaveTel = `tel:${local}`;
    if (
      this.limiteIp.bloqueado(chaveIp) ||
      this.limiteTelefone.bloqueado(chaveTel)
    ) {
      throw new HttpException(
        'Muitas tentativas. Aguarde alguns minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const solicitacoes = await this.prisma.solicitacao.findMany({
      where: { cpf: { in: [cpfLimpo, cpfComMascara(cpfLimpo)] } },
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        telefone: true,
        telefone2: true,
      },
      orderBy: { id: 'desc' },
    });
    const confere = solicitacoes.some(
      (s) =>
        telefoneLocal(s.telefone) === local ||
        telefoneLocal(s.telefone2) === local,
    );
    if (!confere) {
      this.limiteIp.registrarFalha(chaveIp);
      this.limiteTelefone.registrarFalha(chaveTel);
      throw new UnauthorizedException('Os dados não conferem');
    }

    const cliente = await this.vincularCliente(cpfLimpo, local, solicitacoes);
    const novo = await this.criarDispositivo(cliente.id, true, info);
    return this.sessao(novo.dispositivo, novo.token);
  }

  async validarToken(token: string): Promise<DispositivoComCliente | null> {
    if (!token) return null;
    const dispositivo = await this.prisma.chatDispositivo.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { cliente: true },
    });
    if (
      !dispositivo ||
      dispositivo.revogadoEm ||
      dispositivo.expiraEm < new Date()
    ) {
      return null;
    }

    // Evita um UPDATE a cada requisição
    if (Date.now() - dispositivo.ultimoUso.getTime() > 5 * 60 * 1000) {
      await this.prisma.chatDispositivo.update({
        where: { id: dispositivo.id },
        data: { ultimoUso: new Date() },
      });
      await this.prisma.chatCliente.update({
        where: { id: dispositivo.clienteId },
        data: { ultimoAcesso: new Date() },
      });
    }
    return dispositivo;
  }

  async sair(dispositivoId: number) {
    await this.prisma.chatDispositivo.update({
      where: { id: dispositivoId },
      data: { revogadoEm: new Date() },
    });
  }

  sessao(dispositivo: DispositivoComCliente, token?: string) {
    return {
      etapa: 'OK' as const,
      ...(token && { token }),
      verificado: dispositivo.verificado,
      expiraEm: dispositivo.expiraEm,
      cliente: {
        id: dispositivo.cliente.id,
        nome: dispositivo.cliente.nome,
      },
    };
  }

  private async solicitacoesPorTelefone(local: string) {
    // telefone/telefone2 podem estar com máscara ou com 55; compara só os dígitos finais
    return this.prisma.$queryRaw<SolicitacaoResumo[]>`
      SELECT id, nome, cpf, email
      FROM "Solicitacao"
      WHERE right(regexp_replace(coalesce(telefone, ''), '[^0-9]', '', 'g'), ${local.length}::int) = ${local}
         OR right(regexp_replace(coalesce(telefone2, ''), '[^0-9]', '', 'g'), ${local.length}::int) = ${local}
      ORDER BY id DESC
    `;
  }

  private async temHistorico(cpfs: string[]) {
    const total = await this.prisma.chatMensagem.count({
      where: { conversa: { cliente: { cpf: { in: cpfs } } } },
    });
    return total > 0;
  }

  private async vincularCliente(
    cpf: string,
    local: string,
    solicitacoes: SolicitacaoResumo[],
  ) {
    const recente = solicitacoes[0];
    const cliente = await this.prisma.chatCliente.upsert({
      where: { cpf },
      create: {
        cpf,
        nome: recente.nome,
        email: recente.email,
        telefone: `55${local}`,
        ultimoAcesso: new Date(),
      },
      update: { telefone: `55${local}`, ultimoAcesso: new Date() },
    });

    await this.prisma.chatClienteSolicitacao.createMany({
      data: solicitacoes
        .filter((s) => somenteDigitos(s.cpf) === cpf)
        .map((s) => ({ clienteId: cliente.id, solicitacaoId: s.id })),
      skipDuplicates: true,
    });
    return cliente;
  }

  private async criarDispositivo(
    clienteId: number,
    verificado: boolean,
    info: InfoRequisicao,
  ) {
    const token = gerarToken();
    const validade = verificado
      ? CHAT_TOKEN_VALIDADE_MS.verificado
      : CHAT_TOKEN_VALIDADE_MS.naoVerificado;
    const dispositivo = await this.prisma.chatDispositivo.create({
      data: {
        clienteId,
        tokenHash: hashToken(token),
        verificado,
        ip: info.ip,
        userAgent: info.userAgent?.slice(0, 500) ?? null,
        expiraEm: new Date(Date.now() + validade),
      },
      include: { cliente: true },
    });
    return { token, dispositivo };
  }
}
