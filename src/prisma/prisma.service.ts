import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  private readonly retryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
      errorFormat: 'pretty',
    });

    // Log de eventos
    this.$on('warn' as never, (e: any) => {
      this.logger.warn(e);
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(e);
    });
  }

  async onModuleInit() {
    // NÃO bloqueia a inicialização do NestJS
    this.logger.log('🔌 Iniciando conexão em background...');

    // Inicia conexão em background
    this.connectInBackground();
  }

  async onModuleDestroy() {
    this.logger.log('Fechando conexão com o banco de dados...');
    await this.safeDisconnect();
  }

  /**
   * Conecta em background sem bloquear o NestJS
   */
  private connectInBackground(): void {
    this.connectionPromise = this.connectWithRetry()
      .then(() => {
        this.logger.log('✅ Conexão estabelecida com sucesso!');
      })
      .catch((error) => {
        this.logger.error(
          '❌ Falha na conexão inicial. Retry em background continuará...',
          error.message,
        );
        // Continua tentando em background
        setTimeout(() => this.connectInBackground(), 10000);
      });
  }

  /**
   * Garante que está conectado antes de executar operação
   */
  private async ensureConnected(): Promise<void> {
    // Se já conectado, retorna imediatamente
    if (this.isConnected) {
      return;
    }

    // Se está conectando, aguarda
    if (this.isConnecting && this.connectionPromise) {
      await this.connectionPromise;
      return;
    }

    // Se não está conectado nem conectando, tenta conectar
    if (!this.isConnected && !this.isConnecting) {
      await this.connectWithRetry();
    }
  }

  private async connectWithRetry(): Promise<void> {
    if (this.isConnecting) {
      // Evita múltiplas tentativas simultâneas
      return this.connectionPromise || Promise.resolve();
    }

    this.isConnecting = true;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.logger.log(
          `🔄 Tentativa de conexão ${attempt}/${this.retryConfig.maxRetries}...`,
        );
        await this.$connect();
        this.isConnected = true;
        this.isConnecting = false;

        // Testar conexão
        const result: any = await this
          .$queryRaw`SELECT version(), current_database()`;
        this.logger.log(
          `✅ Conectado! Database: ${result[0].current_database}`,
        );
        return;
      } catch (error) {
        this.logger.error(`❌ Falha na tentativa ${attempt}: ${error.message}`);

        if (attempt === this.retryConfig.maxRetries) {
          this.isConnecting = false;
          this.logger.error(
            '❌ Todas as tentativas falharam. Sistema continuará sem DB.',
          );
          throw error;
        }

        const delay = Math.min(
          this.retryConfig.baseDelay * 2 ** (attempt - 1),
          this.retryConfig.maxDelay,
        );
        this.logger.warn(`⏳ Tentando novamente em ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    this.isConnecting = false;
  }

  private async safeDisconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.$disconnect();
        this.isConnected = false;
        this.logger.log('Conexão fechada com sucesso.');
      }
    } catch (error) {
      this.logger.error(`Erro ao fechar conexão: ${error.message}`);
    }
  }

  async healthCheck(): Promise<{ connected: boolean; error?: string }> {
    try {
      await this.ensureConnected();
      await this.$queryRaw`SELECT 1`;
      this.isConnected = true;
      return { connected: true };
    } catch (error) {
      this.logger.error(`Health check falhou: ${error.message}`);
      this.isConnected = false;
      return { connected: false, error: error.message };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Executa operação com retry automático e garantia de conexão
   */
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (attempt < this.retryConfig.maxRetries) {
      try {
        // Garante conexão antes de executar
        await this.ensureConnected();

        return await operation();
      } catch (error) {
        attempt++;

        // Erros não transitórios não devem fazer retry
        if (this.isNonTransientError(error)) {
          throw error;
        }

        if (attempt >= this.retryConfig.maxRetries) {
          this.logger.error(
            `❌ Operação falhou após ${attempt} tentativas: ${error.message}`,
          );
          throw error;
        }

        const delay = Math.min(
          this.retryConfig.baseDelay * 2 ** (attempt - 1),
          this.retryConfig.maxDelay,
        );

        this.logger.warn(
          `⚠️ Retry ${attempt}/${this.retryConfig.maxRetries} em ${delay}ms: ${error?.message}`,
        );
        await this.sleep(delay);

        // Tentar reconectar se erro de conexão
        if (this.isConnectionError(error)) {
          this.logger.warn('🔄 Tentando reconectar...');
          this.isConnected = false;
          try {
            await this.$disconnect();
          } catch (disconnectError) {
            // Ignora erro de desconexão
          }
        }
      }
    }

    throw new Error('Falha inesperada em executeWithRetry.');
  }

  /**
   * Wrapper seguro para queries - NÃO trava o app
   */
  async safeQuery<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await this.executeWithRetry(operation);
    } catch (error) {
      this.logger.error(
        `Operação falhou, retornando fallback: ${error.message}`,
      );
      return fallback;
    }
  }

  /**
   * Verifica se é erro de conexão
   */
  private isConnectionError(error: any): boolean {
    const connectionErrors = [
      'P1001', // Can't reach database server
      'P1002', // Database server timeout
      'P1008', // Operations timed out
      'P1017', // Server has closed the connection
    ];
    return (
      connectionErrors.includes(error.code) ||
      /connection/i.test(error?.message || '') ||
      /timeout/i.test(error?.message || '') ||
      /ECONNREFUSED/i.test(error?.message || '')
    );
  }

  /**
   * Verifica se é erro não transitório (não deve fazer retry)
   */
  private isNonTransientError(error: any): boolean {
    if (error.code) {
      const nonTransientCodes = [
        'P2002', // Unique constraint violation
        'P2003', // Foreign key constraint violation
        'P2004', // Constraint violation
        'P2025', // Record not found
        'P2014', // Required relation violation
        'P2015', // Related record not found
      ];
      return nonTransientCodes.includes(error.code);
    }
    return false;
  }

  /**
   * Estatísticas da conexão
   */
  async getConnectionStats() {
    try {
      await this.ensureConnected();
      const stats = await this.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          current_database() as database
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      return stats;
    } catch (error) {
      this.logger.error(`Erro ao obter stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Status da conexão (útil para health checks)
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
    };
  }
}
