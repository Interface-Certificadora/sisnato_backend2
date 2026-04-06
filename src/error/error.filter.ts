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
  private readonly discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  /**
   * Método principal que captura qualquer exceção lançada na aplicação.
   * Envia o erro para o Discord de forma assíncrona e não bloqueante.
   */
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    // Extração robusta da mensagem
    let messageText: any;
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      messageText = (res as any).message || exception.message;
    } else {
      messageText =
        exception instanceof Error ? exception.message : String(exception);
    }

    this.logger.error(
      `Erro: ${Array.isArray(messageText) ? messageText.join(', ') : messageText} | Rota: ${request.url}`,
    );

    // Envio assíncrono para o Discord (sem travar a resposta)
    this.sendToDiscord({
      content: `🚨 **Erro no Backend**\n**Status:** ${status}\n**Rota:** ${request.url}\n**Mensagem:** ${JSON.stringify(messageText)}`,
    }).catch((err) => this.logger.error('Falha Discord Webhook', err));

    // RESPOSTA PARA O FRONTEND (O que resolve o erro de comunicação)
    return response.status(status).json({
      statusCode: status,
      message: messageText, // Envia a string ou array de erros
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  /**
   * Envia a mensagem para o Discord usando o módulo https nativo do Node.js
   * Retorna uma Promise que resolve quando o envio for concluído ou rejeita em caso de erro.
   */
  private sendToDiscord(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.discordWebhookUrl) {
        this.logger.warn('URL do webhook do Discord não configurada');
        return resolve();
      }

      try {
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
          // Timeout para evitar que a requisição fique travada por muito tempo
          timeout: 5000, // 5 segundos
        };

        const req = https.request(options, (res) => {
          if (
            res.statusCode &&
            (res.statusCode < 200 || res.statusCode >= 300)
          ) {
            reject(new Error(`HTTP error! status: ${res.statusCode}`));
          } else {
            resolve();
          }
          // Consome os dados da resposta para liberar o socket
          res.on('data', () => {});
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.on('timeout', () => {
          req.destroy(new Error('Request timeout'));
        });

        req.write(data);
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
