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

    try {
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

      // Loga o erro no console
      this.logger.error(
        `Erro: ${messageText} | Rota: ${(request as any)?.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );

      // Tenta enviar para o Discord, mas não interrompe o fluxo em caso de erro
      try {
        // Monta a mensagem para o Discord
        const discordMessage = {
          content: `🚨 **Erro capturado no backend** 🚨\n**Status:** ${status}\n**Base URL:** ${request.host}\n**Rota:** ${(request as any)?.url}\n**Mensagem:** ${messageText}\n**Data:** ${new Date().toLocaleString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        };

        // Envia para o Discord usando https nativo (não espera a conclusão)
        this.sendToDiscord(discordMessage).catch((error) => {
          this.logger.error('Falha ao enviar erro para o Discord:', error);
        });
      } catch (discordError) {
        // Apenas loga o erro do Discord, mas não interrompe o fluxo
        this.logger.error(
          'Erro ao preparar mensagem para o Discord:',
          discordError,
        );
      }

      // Retorna resposta HTTP
      return response.status(status).json({
        statusCode: status,
        message: messageText,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } catch (error) {
      // Se algo der errado no tratamento do erro, garante que uma resposta seja enviada
      this.logger.error('Erro inesperado no tratamento de exceção:', error);
      return response.status(500).json({
        statusCode: 500,
        message: 'Ocorreu um erro interno no servidor',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
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
