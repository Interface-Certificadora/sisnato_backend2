import { Module } from '@nestjs/common';
import { ChatAcessoService } from './chat-acesso.service';
import { ChatSalasService } from './chat-salas.service';
import {
  ChatAtendimentoController,
  ChatAtendimentoSocketController,
} from './chat-atendimento.controller';
import { ChatClienteController } from './chat-cliente.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatAtendenteGuard } from './guards/chat-atendente.guard';
import { ChatClienteGuard } from './guards/chat-cliente.guard';

@Module({
  controllers: [
    ChatClienteController,
    ChatAtendimentoController,
    ChatAtendimentoSocketController,
  ],
  providers: [
    ChatAcessoService,
    ChatSalasService,
    ChatService,
    ChatGateway,
    ChatClienteGuard,
    ChatAtendenteGuard,
  ],
})
export class ChatModule {}
