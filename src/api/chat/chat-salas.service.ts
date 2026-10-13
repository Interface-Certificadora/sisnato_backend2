import { Injectable } from '@nestjs/common';
import { ChatConversa, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const salas = {
  atendentes: 'atendentes',
  // dispositivos verificados veem todas as conversas do cliente
  cliente: (clienteId: number) => `cliente:${clienteId}`,
  // não verificados veem só as conversas em que participaram
  dispositivo: (dispositivoId: number) => `dispositivo:${dispositivoId}`,
};

type DispositivoAcesso = {
  id: number;
  clienteId: number;
  verificado: boolean;
};

/** Quem pode ver cada conversa e para quais salas do socket ela vai */
@Injectable()
export class ChatSalasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verificado vê todas as conversas do cliente.
   * Não verificado vê só as conversas em que ele mesmo escreveu, para que
   * outro navegador sem CPF não leia a conversa de ninguém.
   */
  conversasVisiveis(
    dispositivo: DispositivoAcesso,
  ): Prisma.ChatConversaWhereInput {
    if (dispositivo.verificado) return { clienteId: dispositivo.clienteId };
    return {
      clienteId: dispositivo.clienteId,
      verificada: false,
      mensagens: { some: { dispositivoId: dispositivo.id } },
    };
  }

  async conversaVisivel(dispositivo: DispositivoAcesso, conversaId: number) {
    return this.prisma.chatConversa.findFirst({
      where: { id: conversaId, ...this.conversasVisiveis(dispositivo) },
    });
  }

  async conversaVisivelAtendente(conversaId: number) {
    return this.prisma.chatConversa.findUnique({ where: { id: conversaId } });
  }

  async salasDaConversa(conversa: ChatConversa) {
    const destino = [salas.atendentes, salas.cliente(conversa.clienteId)];
    if (!conversa.verificada) {
      const participantes = await this.prisma.chatMensagem.findMany({
        where: { conversaId: conversa.id, dispositivoId: { not: null } },
        distinct: ['dispositivoId'],
        select: { dispositivoId: true },
      });
      destino.push(
        ...participantes.map((p) => salas.dispositivo(p.dispositivoId)),
      );
    }
    return destino;
  }
}
