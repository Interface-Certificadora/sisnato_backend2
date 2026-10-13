import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/auth/auth.guard';
import { AtendenteLogado, ChatService } from './chat.service';
import { CHAT_MIDIA_MAX_BYTES } from './chat.util';
import { ChatConversaFiltroDto } from './dto/conversa-filtro.dto';
import {
  ChatLidasDto,
  ChatMidiaDto,
  ChatPaginacaoDto,
  ChatTextoDto,
} from './dto/mensagem.dto';
import { ChatVincularSolicitacaoDto } from './dto/verificacao.dto';
import { ChatAtendenteGuard } from './guards/chat-atendente.guard';

type RequestAtendente = { user: AtendenteLogado };

@ApiTags('Chat - Atendimento')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChatAtendenteGuard)
@Controller('chat/atendimento')
export class ChatAtendimentoSocketController {
  constructor(private readonly jwt: JwtService) {}

  /**
   * O front guarda o JWT do login em cookie httpOnly; para o socket ele pede
   * este token curto (o socket.io pede outro a cada reconexão).
   */
  @Post('socket-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Token curto (5 min) para conectar no socket' })
  socketToken(@Req() req: { user: any }) {
    const { id, nome, hierarquia, role } = req.user;
    return {
      token: this.jwt.sign(
        { id, nome, hierarquia, role },
        { secret: process.env.JWT_SECRET, expiresIn: '5m' },
      ),
    };
  }
}

/** Rotas dos atendentes (login normal do sistema + role.chat ou ADM) */
@ApiTags('Chat - Atendimento')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChatAtendenteGuard)
@Controller('chat/atendimento/conversas')
export class ChatAtendimentoController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as conversas (fila e em atendimento)' })
  listar(@Query() filtro: ChatConversaFiltroDto, @Req() req: RequestAtendente) {
    return this.chat.listarConversas(filtro, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da conversa, com cliente e solicitações' })
  detalhe(@Param('id', ParseIntPipe) id: number) {
    return this.chat.detalheConversa(id);
  }

  @Get(':id/mensagens')
  @ApiOperation({ summary: 'Mensagens da conversa (paginado por antesDe)' })
  mensagens(
    @Param('id', ParseIntPipe) id: number,
    @Query() pag: ChatPaginacaoDto,
  ) {
    return this.chat.mensagensDaConversa(id, pag);
  }

  @Patch(':id/assumir')
  @ApiOperation({ summary: 'Assume uma conversa que está aguardando' })
  assumir(@Param('id', ParseIntPipe) id: number, @Req() req: RequestAtendente) {
    return this.chat.assumir(id, req.user);
  }

  @Patch(':id/finalizar')
  @ApiOperation({ summary: 'Finaliza o atendimento' })
  finalizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAtendente,
  ) {
    return this.chat.finalizar(id, req.user);
  }

  @Post(':id/mensagens/lidas')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Marca as mensagens do cliente como lidas até ateId',
  })
  marcarLidas(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAtendente,
    @Body() dto: ChatLidasDto,
  ) {
    return this.chat.marcarLidasAtendente(id, req.user, dto.ateId);
  }

  @Post(':id/verificacao')
  @ApiOperation({
    summary: 'Pede ao cliente não verificado que confirme o CPF',
  })
  solicitarVerificacao(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAtendente,
  ) {
    return this.chat.solicitarVerificacao(id, req.user);
  }

  @Patch(':id/verificacao/cancelar')
  @ApiOperation({ summary: 'Cancela a verificação pendente' })
  cancelarVerificacao(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAtendente,
  ) {
    return this.chat.cancelarVerificacao(id, req.user);
  }

  @Patch(':id/solicitacao')
  @ApiOperation({
    summary: 'Define a solicitação da conversa (cliente com mais de uma)',
  })
  vincularSolicitacao(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAtendente,
    @Body() dto: ChatVincularSolicitacaoDto,
  ) {
    return this.chat.vincularSolicitacao(id, req.user, dto.solicitacaoId);
  }

  @Post(':id/mensagens')
  @ApiOperation({
    summary: 'Responde com texto (assume se estiver aguardando)',
  })
  enviarTexto(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAtendente,
    @Body() dto: ChatTextoDto,
  ) {
    return this.chat.enviarTextoAtendente(id, req.user, dto.texto);
  }

  @Post(':id/midia')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: CHAT_MIDIA_MAX_BYTES } }),
  )
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
  @ApiOperation({ summary: 'Responde com imagem, áudio ou PDF' })
  enviarMidia(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAtendente,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ChatMidiaDto,
  ) {
    return this.chat.enviarMidiaAtendente(id, req.user, file, dto);
  }
}
