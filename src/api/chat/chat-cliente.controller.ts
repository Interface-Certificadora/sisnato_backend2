import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  ChatAcessoService,
  DispositivoComCliente,
} from './chat-acesso.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import {
  CHAT_MIDIA_MAX_BYTES,
  CHAT_TOKEN_HEADER,
  ipDaRequisicao,
} from './chat.util';
import { ChatAcessoCpfDto, ChatAcessoDto } from './dto/acesso.dto';
import {
  ChatLidasDto,
  ChatMidiaDto,
  ChatPaginacaoDto,
  ChatTextoDto,
} from './dto/mensagem.dto';
import { ChatVerificacaoRespostaDto } from './dto/verificacao.dto';
import { ChatClienteGuard } from './guards/chat-cliente.guard';

type RequestChat = Request & { chat: DispositivoComCliente };

const headerToken = {
  name: CHAT_TOKEN_HEADER,
  description: 'Token do chat salvo no navegador',
};

/** Rotas públicas do webchat (lado do cliente) */
@ApiTags('Chat - Cliente')
@Controller('chat')
export class ChatClienteController {
  constructor(
    private readonly acesso: ChatAcessoService,
    private readonly chat: ChatService,
    private readonly gateway: ChatGateway,
  ) {}

  @Post('acesso')
  @HttpCode(200)
  @ApiHeader({ ...headerToken, required: false })
  @ApiOperation({
    summary: 'Entrada pelo telefone da URL',
    description:
      'etapa "OK" devolve a sessão (e o token, se for novo). etapa "CPF" indica que é preciso chamar /chat/acesso/cpf.',
  })
  acessar(@Body() dto: ChatAcessoDto, @Req() req: Request) {
    const token = req.headers[CHAT_TOKEN_HEADER];
    return this.acesso.acessar(
      dto.telefone,
      typeof token === 'string' ? token : undefined,
      this.info(req),
    );
  }

  @Post('acesso/cpf')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Entrada com telefone + CPF (gera token verificado)',
  })
  acessarComCpf(@Body() dto: ChatAcessoCpfDto, @Req() req: Request) {
    return this.acesso.acessarComCpf(dto.telefone, dto.cpf, this.info(req));
  }

  @Get('sessao')
  @UseGuards(ChatClienteGuard)
  @ApiHeader(headerToken)
  @ApiOperation({
    summary: 'Sessão, conversa aberta, não lidas e verificação pendente',
  })
  async sessao(@Req() req: RequestChat) {
    return {
      ...this.acesso.sessao(req.chat),
      ...(await this.chat.resumoDoCliente(req.chat)),
    };
  }

  @Post('sair')
  @HttpCode(204)
  @UseGuards(ChatClienteGuard)
  @ApiHeader(headerToken)
  @ApiOperation({ summary: 'Revoga o token deste navegador' })
  async sair(@Req() req: RequestChat) {
    await this.acesso.sair(req.chat.id);
    this.gateway.desconectarDispositivo(req.chat.id);
  }

  @Post('mensagens/lidas')
  @HttpCode(200)
  @UseGuards(ChatClienteGuard)
  @ApiHeader(headerToken)
  @ApiOperation({
    summary: 'Marca as mensagens recebidas como lidas até ateId',
  })
  marcarLidas(@Req() req: RequestChat, @Body() dto: ChatLidasDto) {
    return this.chat.marcarLidasCliente(req.chat, dto.ateId);
  }

  @Post('verificacao/:id')
  @HttpCode(200)
  @UseGuards(ChatClienteGuard)
  @ApiHeader(headerToken)
  @ApiOperation({
    summary: 'Responde a verificação pedida pelo atendente (CPF)',
    description: 'Se o CPF conferir, o token atual passa a ser verificado.',
  })
  responderVerificacao(
    @Req() req: RequestChat,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChatVerificacaoRespostaDto,
  ) {
    return this.chat.responderVerificacao(req.chat, id, dto.cpf);
  }

  @Get('mensagens')
  @UseGuards(ChatClienteGuard)
  @ApiHeader(headerToken)
  @ApiOperation({ summary: 'Histórico de mensagens (paginado por antesDe)' })
  mensagens(@Req() req: RequestChat, @Query() pag: ChatPaginacaoDto) {
    return this.chat.mensagensDoCliente(req.chat, pag);
  }

  @Post('mensagens')
  @UseGuards(ChatClienteGuard)
  @ApiHeader(headerToken)
  @ApiOperation({ summary: 'Envia mensagem de texto' })
  enviarTexto(@Req() req: RequestChat, @Body() dto: ChatTextoDto) {
    return this.chat.enviarTextoCliente(req.chat, dto.texto);
  }

  @Post('midia')
  @UseGuards(ChatClienteGuard)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: CHAT_MIDIA_MAX_BYTES } }),
  )
  @ApiHeader(headerToken)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        texto: { type: 'string' },
        duracaoSeg: { type: 'integer' },
      },
    },
  })
  @ApiOperation({ summary: 'Envia imagem, áudio ou PDF' })
  enviarMidia(
    @Req() req: RequestChat,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ChatMidiaDto,
  ) {
    return this.chat.enviarMidiaCliente(req.chat, file, dto);
  }

  private info(req: Request) {
    return {
      ip: ipDaRequisicao(req),
      userAgent: req.headers['user-agent'] ?? null,
    };
  }
}
