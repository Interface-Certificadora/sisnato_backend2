import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import https from 'https';
import { Request, Response } from 'express';

@Catch()
export class DiscordExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DiscordExceptionFilter.name);
  private readonly discordWebhookUrl =
    'https://discord.com/api/webhooks/1371912916588171344/RbIN9OY1fprOYKT-Y1XtEdwXuH1R7ZKlPKF-8LftyC27tDP2Ba-CMrhOmy-E4Kfj-e7j';

  /**
   * Método principal que captura qualquer exceção lançada na aplicação.
   * Envia o erro para o Discord e registra no console.
   */
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : String(exception);

    // Extrai somente o texto da mensagem de erro
    let messageText: string;
    if (typeof message === 'string') {
      messageText = message;
    } else if ((message as any)?.message) {
      messageText = (message as any).message;
    } else {
      messageText = JSON.stringify(message, null, 2);
    }

    // Monta a mensagem para o Discord
    const discordMessage = {
      content: `🚨 **Erro capturado no backend** 🚨\n**Status:** ${status}\n**Base URL:** ${request.host}\n**Rota:** ${(request as any)?.url}\n**Mensagem:** ${messageText}\n**Data:** ${new Date().toLocaleString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    };

    // Envia para o Discord usando https nativo
    this.sendToDiscord(discordMessage);

    // Loga no console (opcional)
    this.logger.error(
      `Erro: ${messageText} | Rota: ${(request as any)?.url}`,
    );

    // Retorna resposta HTTP
    const response = ctx.getResponse<Response>();
    response.status(status).json({
      statusCode: status,
      message: messageText,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  /**
   * Envia a mensagem para o Discord usando o módulo https nativo do Node.js
   * Não depende de bibliotecas externas.
   */
  private sendToDiscord(message: any) {
    const data = JSON.stringify(message);
    const url = new URL(this.discordWebhookUrl);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      // Opcional: pode tratar resposta, se necessário
      res.on('data', () => {});
    });

    req.on('error', (error: any) => {
      this.logger.error('Erro ao enviar log para Discord:', error);
    });

    req.write(data);
    req.end();
  }
}
