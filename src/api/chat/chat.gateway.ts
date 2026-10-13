import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatConversa } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { ChatAcessoService } from './chat-acesso.service';
import { ChatSalasService, salas } from './chat-salas.service';
import { podeAtender } from './guards/chat-atendente.guard';

const origens = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['*'];

type DadosSocket = {
  atendente?: { id: number; nome: string | null };
  dispositivo?: { id: number; clienteId: number; verificado: boolean };
};

/**
 * Socket.IO em /chat. O envio de mensagens é feito pela API REST;
 * o socket entrega os eventos em tempo real e repassa o "digitando".
 *
 * Cliente:   io('/chat', { auth: { token: <token do chat> } })
 * Atendente: io('/chat', { auth: { jwt: <token do login> } })
 *
 * Emitidos:  'mensagem:nova', 'mensagens:lidas', 'conversa:atualizada',
 *            'verificacao:solicitada', 'verificacao:atualizada', 'digitando'
 * Recebidos: 'digitando' { conversaId, digitando }
 */
@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: origens.includes('*') ? true : origens, credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly acesso: ChatAcessoService,
    private readonly salasService: ChatSalasService,
    private readonly jwt: JwtService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const { token, jwt } = socket.handshake.auth ?? {};
      const dados = socket.data as DadosSocket;

      if (jwt) {
        const user = await this.jwt.verifyAsync(jwt, {
          secret: process.env.JWT_SECRET,
        });
        if (!podeAtender(user)) throw new Error('sem permissão de chat');
        dados.atendente = { id: user.id, nome: user.nome ?? null };
        await socket.join(salas.atendentes);
        return;
      }

      const dispositivo = await this.acesso.validarToken(token);
      if (!dispositivo) throw new Error('token do chat inválido');
      dados.dispositivo = {
        id: dispositivo.id,
        clienteId: dispositivo.clienteId,
        verificado: dispositivo.verificado,
      };
      await socket.join(salas.dispositivo(dispositivo.id));
      if (dispositivo.verificado) {
        await socket.join(salas.cliente(dispositivo.clienteId));
      }
    } catch (error) {
      this.logger.debug(`Conexão recusada: ${(error as Error).message}`);
      socket.emit('erro', { message: 'Não autorizado' });
      socket.disconnect(true);
    }
  }

  /** O front deve mandar no máximo a cada ~2s e um digitando:false ao parar */
  @SubscribeMessage('digitando')
  async digitando(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversaId?: number; digitando?: boolean },
  ) {
    const conversaId = Number(body?.conversaId);
    if (!Number.isInteger(conversaId)) return;
    const dados = socket.data as DadosSocket;

    try {
      let conversa: ChatConversa | null = null;
      let autor: { autorTipo: string; nome: string | null };
      if (dados.atendente) {
        conversa = await this.salasService.conversaVisivelAtendente(conversaId);
        autor = { autorTipo: 'ATENDENTE', nome: dados.atendente.nome };
      } else if (dados.dispositivo) {
        conversa = await this.salasService.conversaVisivel(
          dados.dispositivo,
          conversaId,
        );
        autor = { autorTipo: 'CLIENTE', nome: null };
      }
      if (!conversa) return;

      socket
        .to(await this.salasService.salasDaConversa(conversa))
        .emit('digitando', {
          conversaId,
          ...autor,
          digitando: body.digitando !== false,
        });
    } catch (error) {
      this.logger.error('Erro no evento digitando', error);
    }
  }

  emitir(salasDestino: string[], evento: string, dados: unknown) {
    if (salasDestino.length) this.server.to(salasDestino).emit(evento, dados);
  }

  /** Dispositivo confirmou o CPF: os sockets dele passam a ver tudo do cliente */
  promoverDispositivo(dispositivoId: number, clienteId: number) {
    const sala = salas.dispositivo(dispositivoId);
    this.server.in(sala).socketsJoin(salas.cliente(clienteId));
    this.server
      .in(sala)
      .fetchSockets()
      .then((sockets) => {
        for (const s of sockets) {
          const d = (s.data as DadosSocket).dispositivo;
          if (d) d.verificado = true;
        }
      });
  }

  desconectarDispositivo(dispositivoId: number) {
    this.server.in(salas.dispositivo(dispositivoId)).disconnectSockets(true);
  }
}
