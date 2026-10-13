import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ChatAutorTipo,
  ChatConversa,
  ChatConversaStatus,
  ChatMensagemTipo,
  ChatVerificacaoStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { extension } from 'mime-types';
import sharp from 'sharp';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { DispositivoComCliente } from './chat-acesso.service';
import { ChatSalasService } from './chat-salas.service';
import { ChatGateway } from './chat.gateway';
import {
  CHAT_BUCKET,
  CHAT_MIDIA_MAX_BYTES,
  CHAT_TOKEN_VALIDADE_MS,
  cpfValido,
} from './chat.util';
import { ChatConversaFiltroDto } from './dto/conversa-filtro.dto';
import { ChatMidiaDto, ChatPaginacaoDto } from './dto/mensagem.dto';

const MIMES: Record<string, ChatMensagemTipo> = {
  'image/jpeg': 'IMAGEM',
  'image/png': 'IMAGEM',
  'image/webp': 'IMAGEM',
  'image/gif': 'IMAGEM',
  // Chrome grava em webm/ogg, Safari em mp4
  'audio/webm': 'AUDIO',
  'audio/ogg': 'AUDIO',
  'audio/mp4': 'AUDIO',
  'audio/x-m4a': 'AUDIO',
  'audio/aac': 'AUDIO',
  'audio/mpeg': 'AUDIO',
  'audio/wav': 'AUDIO',
  'application/pdf': 'ARQUIVO',
};

const includeMensagem = {
  atendente: { select: { id: true, nome: true } },
  midia: true,
} satisfies Prisma.ChatMensagemInclude;

type MensagemCompleta = Prisma.ChatMensagemGetPayload<{
  include: typeof includeMensagem;
}>;

const MAX_TENTATIVAS_VERIFICACAO = 3;

type Autor =
  | { tipo: 'CLIENTE'; dispositivo: DispositivoComCliente }
  | { tipo: 'ATENDENTE'; atendenteId: number };

export type AtendenteLogado = {
  id: number;
  nome?: string;
  hierarquia?: string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly gateway: ChatGateway,
    private readonly salas: ChatSalasService,
  ) {}

  // ───────────── Cliente ─────────────

  async mensagensDoCliente(
    dispositivo: DispositivoComCliente,
    pag: ChatPaginacaoDto,
  ) {
    const mensagens = await this.prisma.chatMensagem.findMany({
      where: {
        conversa: this.salas.conversasVisiveis(dispositivo),
        ...(pag.antesDe && { id: { lt: pag.antesDe } }),
      },
      include: includeMensagem,
      orderBy: { id: 'desc' },
      take: pag.limite ?? 50,
    });
    return Promise.all(mensagens.reverse().map((m) => this.serializar(m)));
  }

  async conversaAbertaDoCliente(dispositivo: DispositivoComCliente) {
    return this.prisma.chatConversa.findFirst({
      where: {
        ...this.salas.conversasVisiveis(dispositivo),
        verificada: dispositivo.verificado,
        status: { not: ChatConversaStatus.FINALIZADA },
      },
      select: { id: true, status: true, verificada: true, iniciadaEm: true },
      orderBy: { id: 'desc' },
    });
  }

  async enviarTextoCliente(dispositivo: DispositivoComCliente, texto: string) {
    const conversa = await this.obterOuCriarConversa(dispositivo);
    return this.registrarMensagem(conversa, {
      autorTipo: 'CLIENTE',
      dispositivoId: dispositivo.id,
      texto: texto.trim(),
    });
  }

  async enviarMidiaCliente(
    dispositivo: DispositivoComCliente,
    file: Express.Multer.File,
    dto: ChatMidiaDto,
  ) {
    this.validarArquivo(file);
    const conversa = await this.obterOuCriarConversa(dispositivo);
    return this.registrarMidia(
      conversa,
      { tipo: 'CLIENTE', dispositivo },
      file,
      dto,
    );
  }

  async resumoDoCliente(dispositivo: DispositivoComCliente) {
    const visiveis = this.salas.conversasVisiveis(dispositivo);
    const [conversa, naoLidas, verificacaoPendente] = await Promise.all([
      this.conversaAbertaDoCliente(dispositivo),
      this.prisma.chatMensagem.count({
        where: {
          conversa: visiveis,
          autorTipo: { not: 'CLIENTE' },
          lidaEm: null,
        },
      }),
      this.prisma.chatVerificacao.findFirst({
        where: { conversa: visiveis, status: ChatVerificacaoStatus.PENDENTE },
        select: { id: true, conversaId: true, tentativas: true },
        orderBy: { id: 'desc' },
      }),
    ]);
    return { conversa, naoLidas, verificacaoPendente };
  }

  /** Cliente leu tudo (do atendente/sistema) até a mensagem ateId */
  async marcarLidasCliente(dispositivo: DispositivoComCliente, ateId: number) {
    return this.marcarLidas(
      {
        conversa: this.salas.conversasVisiveis(dispositivo),
        autorTipo: { not: 'CLIENTE' },
        id: { lte: ateId },
      },
      'CLIENTE',
    );
  }

  /**
   * Resposta do cliente à verificação pedida pelo atendente.
   * Se o CPF bater, o mesmo token passa a ser verificado.
   */
  async responderVerificacao(
    dispositivo: DispositivoComCliente,
    verificacaoId: number,
    cpf: string,
  ) {
    const verificacao = await this.prisma.chatVerificacao.findUnique({
      where: { id: verificacaoId },
    });
    const conversa =
      verificacao &&
      (await this.salas.conversaVisivel(dispositivo, verificacao.conversaId));
    if (!conversa) throw new NotFoundException('Verificação não encontrada');
    if (verificacao.status !== ChatVerificacaoStatus.PENDENTE) {
      throw new ConflictException('Verificação não está mais pendente');
    }

    const tentativas = verificacao.tentativas + 1;

    if (cpfValido(cpf) !== dispositivo.cliente.cpf) {
      const falhou = tentativas >= MAX_TENTATIVAS_VERIFICACAO;
      await this.prisma.chatVerificacao.update({
        where: { id: verificacao.id },
        data: {
          tentativas,
          dispositivoId: dispositivo.id,
          ...(falhou && {
            status: ChatVerificacaoStatus.FALHOU,
            respondidaEm: new Date(),
          }),
        },
      });
      if (falhou) {
        await this.registrarMensagem(conversa, {
          autorTipo: 'SISTEMA',
          texto: 'Confirmação de CPF falhou',
        });
        this.notificarVerificacao(conversa, verificacao.id, 'FALHOU');
      }
      // 400 e não 401: o front não deve tratar como sessão expirada
      throw new BadRequestException({
        message: 'CPF não confere',
        tentativasRestantes: MAX_TENTATIVAS_VERIFICACAO - tentativas,
      });
    }

    const [, , atualizada] = await this.prisma.$transaction([
      this.prisma.chatVerificacao.update({
        where: { id: verificacao.id },
        data: {
          tentativas,
          dispositivoId: dispositivo.id,
          status: ChatVerificacaoStatus.CONFIRMADA,
          respondidaEm: new Date(),
        },
      }),
      this.prisma.chatDispositivo.update({
        where: { id: dispositivo.id },
        data: {
          verificado: true,
          expiraEm: new Date(Date.now() + CHAT_TOKEN_VALIDADE_MS.verificado),
        },
      }),
      this.prisma.chatConversa.update({
        where: { id: conversa.id },
        data: { verificada: true },
      }),
    ]);

    // Antes de emitir: com a conversa verificada, as salas de dispositivo saem
    this.gateway.promoverDispositivo(dispositivo.id, dispositivo.clienteId);
    await this.registrarMensagem(atualizada, {
      autorTipo: 'SISTEMA',
      texto: 'CPF confirmado pelo cliente',
    });
    this.notificarVerificacao(atualizada, verificacao.id, 'CONFIRMADA');
    this.notificarConversa(atualizada);
    return { verificado: true };
  }

  // ───────────── Atendimento ─────────────

  async listarConversas(filtro: ChatConversaFiltroDto, user: AtendenteLogado) {
    return this.prisma.chatConversa.findMany({
      where: {
        ...(filtro.status && { status: filtro.status }),
        ...(filtro.minhas && { atendenteId: user.id }),
      },
      include: {
        cliente: {
          select: { id: true, nome: true, telefone: true, cpf: true },
        },
        atendente: { select: { id: true, nome: true } },
        _count: {
          select: {
            mensagens: { where: { autorTipo: 'CLIENTE', lidaEm: null } },
          },
        },
        mensagens: {
          orderBy: { id: 'desc' },
          take: 1,
          select: {
            id: true,
            tipo: true,
            texto: true,
            autorTipo: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { ultimaMensagemEm: { sort: 'desc', nulls: 'last' } },
        { id: 'desc' },
      ],
      take: 200,
    });
  }

  async detalheConversa(id: number) {
    const conversa = await this.prisma.chatConversa.findUnique({
      where: { id },
      include: {
        cliente: {
          include: {
            solicitacoes: {
              include: {
                solicitacao: {
                  select: {
                    id: true,
                    nome: true,
                    cpf: true,
                    email: true,
                    andamento: true,
                  },
                },
              },
            },
          },
        },
        atendente: { select: { id: true, nome: true } },
        solicitacao: { select: { id: true, nome: true, andamento: true } },
        verificacoes: {
          where: { status: ChatVerificacaoStatus.PENDENTE },
          select: { id: true, tentativas: true, createdAt: true },
          orderBy: { id: 'desc' },
          take: 1,
        },
      },
    });
    if (!conversa) throw new NotFoundException('Conversa não encontrada');
    return conversa;
  }

  async mensagensDaConversa(id: number, pag: ChatPaginacaoDto) {
    const mensagens = await this.prisma.chatMensagem.findMany({
      where: {
        conversaId: id,
        ...(pag.antesDe && { id: { lt: pag.antesDe } }),
      },
      include: includeMensagem,
      orderBy: { id: 'desc' },
      take: pag.limite ?? 50,
    });
    return Promise.all(mensagens.reverse().map((m) => this.serializar(m)));
  }

  async assumir(id: number, user: AtendenteLogado) {
    const { count } = await this.prisma.chatConversa.updateMany({
      where: { id, status: ChatConversaStatus.AGUARDANDO },
      data: {
        status: ChatConversaStatus.EM_ATENDIMENTO,
        atendenteId: user.id,
        assumidaEm: new Date(),
      },
    });
    if (!count) {
      throw new ConflictException('Conversa já assumida ou finalizada');
    }
    const conversa = await this.buscarConversa(id);
    await this.registrarMensagem(conversa, {
      autorTipo: 'SISTEMA',
      texto: `${user.nome || 'Um atendente'} entrou no atendimento`,
    });
    this.notificarConversa(conversa);
    return conversa;
  }

  async finalizar(id: number, user: AtendenteLogado) {
    const conversa = await this.buscarConversa(id);
    if (conversa.status === ChatConversaStatus.FINALIZADA) {
      throw new ConflictException('Conversa já finalizada');
    }
    this.garantirResponsavel(conversa, user);

    await this.registrarMensagem(conversa, {
      autorTipo: 'SISTEMA',
      texto: 'Atendimento finalizado',
    });
    const atualizada = await this.prisma.chatConversa.update({
      where: { id },
      data: {
        status: ChatConversaStatus.FINALIZADA,
        finalizadaEm: new Date(),
        finalizadaPorId: user.id,
      },
    });
    this.notificarConversa(atualizada);
    return atualizada;
  }

  async enviarTextoAtendente(id: number, user: AtendenteLogado, texto: string) {
    const conversa = await this.conversaParaAtendente(id, user);
    return this.registrarMensagem(conversa, {
      autorTipo: 'ATENDENTE',
      atendenteId: user.id,
      texto: texto.trim(),
    });
  }

  async enviarMidiaAtendente(
    id: number,
    user: AtendenteLogado,
    file: Express.Multer.File,
    dto: ChatMidiaDto,
  ) {
    this.validarArquivo(file);
    const conversa = await this.conversaParaAtendente(id, user);
    return this.registrarMidia(
      conversa,
      { tipo: 'ATENDENTE', atendenteId: user.id },
      file,
      dto,
    );
  }

  /** Atendente leu as mensagens do cliente até ateId */
  async marcarLidasAtendente(id: number, user: AtendenteLogado, ateId: number) {
    const conversa = await this.buscarConversa(id);
    // Olhar a fila não conta como leitura
    if (conversa.status === ChatConversaStatus.AGUARDANDO) return { lidas: 0 };
    this.garantirResponsavel(conversa, user);
    return this.marcarLidas(
      { conversaId: id, autorTipo: 'CLIENTE', id: { lte: ateId } },
      'ATENDENTE',
    );
  }

  async solicitarVerificacao(id: number, user: AtendenteLogado) {
    const conversa = await this.conversaParaAtendente(id, user);
    if (conversa.verificada) {
      throw new BadRequestException('Conversa já verificada');
    }

    const [, verificacao] = await this.prisma.$transaction([
      this.prisma.chatVerificacao.updateMany({
        where: { conversaId: id, status: ChatVerificacaoStatus.PENDENTE },
        data: {
          status: ChatVerificacaoStatus.CANCELADA,
          respondidaEm: new Date(),
        },
      }),
      this.prisma.chatVerificacao.create({
        data: { conversaId: id, solicitadaPorId: user.id },
      }),
    ]);

    await this.registrarMensagem(conversa, {
      autorTipo: 'SISTEMA',
      texto: 'O atendente pediu a confirmação do seu CPF',
    });
    this.gateway.emitir(
      await this.salas.salasDaConversa(conversa),
      'verificacao:solicitada',
      { id: verificacao.id, conversaId: id },
    );
    return verificacao;
  }

  async cancelarVerificacao(id: number, user: AtendenteLogado) {
    const conversa = await this.buscarConversa(id);
    this.garantirResponsavel(conversa, user);
    const pendente = await this.prisma.chatVerificacao.findFirst({
      where: { conversaId: id, status: ChatVerificacaoStatus.PENDENTE },
    });
    if (!pendente) {
      throw new NotFoundException('Nenhuma verificação pendente');
    }
    await this.prisma.chatVerificacao.update({
      where: { id: pendente.id },
      data: {
        status: ChatVerificacaoStatus.CANCELADA,
        respondidaEm: new Date(),
      },
    });
    this.notificarVerificacao(conversa, pendente.id, 'CANCELADA');
    return { id: pendente.id, status: ChatVerificacaoStatus.CANCELADA };
  }

  /** Define a solicitação da conversa (entre as vinculadas ao cliente) */
  async vincularSolicitacao(
    id: number,
    user: AtendenteLogado,
    solicitacaoId: number,
  ) {
    const conversa = await this.buscarConversa(id);
    this.garantirResponsavel(conversa, user);
    const vinculo = await this.prisma.chatClienteSolicitacao.findUnique({
      where: {
        clienteId_solicitacaoId: {
          clienteId: conversa.clienteId,
          solicitacaoId,
        },
      },
    });
    if (!vinculo) {
      throw new BadRequestException('Solicitação não pertence a este cliente');
    }
    const atualizada = await this.prisma.chatConversa.update({
      where: { id },
      data: { solicitacaoId },
    });
    this.notificarConversa(atualizada);
    return atualizada;
  }

  // ───────────── Interno ─────────────

  private async marcarLidas(
    where: Prisma.ChatMensagemWhereInput,
    leitor: 'CLIENTE' | 'ATENDENTE',
  ) {
    const pendentes = await this.prisma.chatMensagem.findMany({
      where: { ...where, lidaEm: null },
      select: { id: true, conversaId: true },
    });
    if (!pendentes.length) return { lidas: 0 };

    const lidaEm = new Date();
    await this.prisma.chatMensagem.updateMany({
      where: { id: { in: pendentes.map((p) => p.id) } },
      data: { lidaEm },
    });

    const ultimaPorConversa = new Map<number, number>();
    for (const p of pendentes) {
      ultimaPorConversa.set(
        p.conversaId,
        Math.max(p.id, ultimaPorConversa.get(p.conversaId) ?? 0),
      );
    }
    const conversas = await this.prisma.chatConversa.findMany({
      where: { id: { in: [...ultimaPorConversa.keys()] } },
    });
    for (const conversa of conversas) {
      this.gateway.emitir(
        await this.salas.salasDaConversa(conversa),
        'mensagens:lidas',
        {
          conversaId: conversa.id,
          ateId: ultimaPorConversa.get(conversa.id),
          leitor,
          lidaEm,
        },
      );
    }
    return { lidas: pendentes.length };
  }

  private notificarVerificacao(
    conversa: ChatConversa,
    verificacaoId: number,
    status: ChatVerificacaoStatus,
  ) {
    this.salas
      .salasDaConversa(conversa)
      .then((s) =>
        this.gateway.emitir(s, 'verificacao:atualizada', {
          id: verificacaoId,
          conversaId: conversa.id,
          status,
        }),
      )
      .catch((e) => this.logger.error('Erro ao notificar verificação', e));
  }

  private async obterOuCriarConversa(dispositivo: DispositivoComCliente) {
    const aberta = await this.conversaAbertaDoCliente(dispositivo);
    if (aberta) return this.buscarConversa(aberta.id);

    const vinculos = await this.prisma.chatClienteSolicitacao.findMany({
      where: { clienteId: dispositivo.clienteId },
      select: { solicitacaoId: true },
    });
    const conversa = await this.prisma.chatConversa.create({
      data: {
        clienteId: dispositivo.clienteId,
        verificada: dispositivo.verificado,
        // Com mais de uma solicitação, o atendente define depois
        solicitacaoId: vinculos.length === 1 ? vinculos[0].solicitacaoId : null,
      },
    });
    this.notificarConversa(conversa);
    return conversa;
  }

  private async buscarConversa(id: number) {
    const conversa = await this.prisma.chatConversa.findUnique({
      where: { id },
    });
    if (!conversa) throw new NotFoundException('Conversa não encontrada');
    return conversa;
  }

  private garantirResponsavel(conversa: ChatConversa, user: AtendenteLogado) {
    if (
      conversa.atendenteId &&
      conversa.atendenteId !== user.id &&
      user.hierarquia !== 'ADM'
    ) {
      throw new ForbiddenException('Conversa está com outro atendente');
    }
  }

  /** Se ainda estiver aguardando, quem responde assume */
  private async conversaParaAtendente(id: number, user: AtendenteLogado) {
    const conversa = await this.buscarConversa(id);
    if (conversa.status === ChatConversaStatus.FINALIZADA) {
      throw new BadRequestException('Conversa finalizada');
    }
    if (conversa.status === ChatConversaStatus.AGUARDANDO) {
      return this.assumir(id, user);
    }
    this.garantirResponsavel(conversa, user);
    return conversa;
  }

  private validarArquivo(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo obrigatório');
    if (file.size > CHAT_MIDIA_MAX_BYTES) {
      throw new BadRequestException('Arquivo maior que 16MB');
    }
    if (!MIMES[this.mimeBase(file.mimetype)]) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido: ${file.mimetype}`,
      );
    }
  }

  private mimeBase(mime: string) {
    // "audio/webm;codecs=opus" → "audio/webm"
    return (mime || '').split(';')[0].trim().toLowerCase();
  }

  private async registrarMidia(
    conversa: ChatConversa,
    autor: Autor,
    file: Express.Multer.File,
    dto: ChatMidiaDto,
  ) {
    const mime = this.mimeBase(file.mimetype);
    const tipo = MIMES[mime];
    const chave = `conversa-${conversa.id}/${randomUUID()}.${extension(mime) || 'bin'}`;

    let largura: number | null = null;
    let altura: number | null = null;
    if (tipo === 'IMAGEM') {
      try {
        const meta = await sharp(file.buffer).metadata();
        largura = meta.width ?? null;
        altura = meta.height ?? null;
      } catch {
        throw new BadRequestException('Imagem inválida');
      }
    }

    await this.s3.uploadFile(CHAT_BUCKET, chave, mime, file.buffer);

    try {
      const midia = await this.prisma.chatMidia.create({
        data: {
          tipo,
          bucket: CHAT_BUCKET,
          chave,
          mime,
          tamanho: file.size,
          // multer entrega o nome em latin1
          nomeOriginal:
            tipo === 'ARQUIVO'
              ? Buffer.from(file.originalname, 'latin1')
                  .toString('utf8')
                  .slice(0, 255)
              : null,
          duracaoSeg: tipo === 'AUDIO' ? (dto.duracaoSeg ?? null) : null,
          largura,
          altura,
          ...(autor.tipo === 'CLIENTE'
            ? { dispositivoId: autor.dispositivo.id }
            : { atendenteId: autor.atendenteId }),
        },
      });

      return await this.registrarMensagem(conversa, {
        autorTipo: autor.tipo,
        tipo,
        midiaId: midia.id,
        texto: dto.texto?.trim() || null,
        ...(autor.tipo === 'CLIENTE'
          ? { dispositivoId: autor.dispositivo.id }
          : { atendenteId: autor.atendenteId }),
      });
    } catch (error) {
      await this.s3.deleteFile(CHAT_BUCKET, chave).catch(() => undefined);
      throw error;
    }
  }

  private async registrarMensagem(
    conversa: ChatConversa,
    dados: {
      autorTipo: ChatAutorTipo;
      tipo?: ChatMensagemTipo;
      texto?: string | null;
      atendenteId?: number;
      dispositivoId?: number;
      midiaId?: number;
    },
  ) {
    const [mensagem] = await this.prisma.$transaction([
      this.prisma.chatMensagem.create({
        data: { conversaId: conversa.id, ...dados },
        include: includeMensagem,
      }),
      this.prisma.chatConversa.update({
        where: { id: conversa.id },
        data: { ultimaMensagemEm: new Date() },
      }),
    ]);

    const payload = await this.serializar(mensagem);
    this.gateway.emitir(
      await this.salas.salasDaConversa(conversa),
      'mensagem:nova',
      payload,
    );
    return payload;
  }

  private notificarConversa(conversa: ChatConversa) {
    this.salas
      .salasDaConversa(conversa)
      .then((s) =>
        this.gateway.emitir(s, 'conversa:atualizada', {
          id: conversa.id,
          status: conversa.status,
          atendenteId: conversa.atendenteId,
          verificada: conversa.verificada,
          solicitacaoId: conversa.solicitacaoId,
        }),
      )
      .catch((e) => this.logger.error('Erro ao notificar conversa', e));
  }

  private async serializar(m: MensagemCompleta) {
    return {
      id: m.id,
      conversaId: m.conversaId,
      autorTipo: m.autorTipo,
      tipo: m.tipo,
      texto: m.texto,
      lidaEm: m.lidaEm,
      createdAt: m.createdAt,
      atendente: m.atendente,
      midia: m.midia && {
        id: m.midia.id,
        tipo: m.midia.tipo,
        mime: m.midia.mime,
        tamanho: m.midia.tamanho,
        nomeOriginal: m.midia.nomeOriginal,
        duracaoSeg: m.midia.duracaoSeg,
        largura: m.midia.largura,
        altura: m.midia.altura,
        url: await this.s3.getSignedFileUrl(CHAT_BUCKET, m.midia.chave),
      },
    };
  }
}
