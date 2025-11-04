import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// A sua configuração de retry é perfeita.
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // Mantemos sua configuração de retry
  private readonly retryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  constructor() {
    super({
      // A URL é pega automaticamente do .env,
      // mas podemos manter sua configuração de logs
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
      errorFormat: 'pretty',
    });

    // Seus listeners de log
    this.$on('warn' as never, (e: any) => {
      this.logger.warn(e);
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(e);
    });
  }

  /**
   * ROBUSTEZ NA INICIALIZAÇÃO:
   * Garante que o NestJS só inicie DEPOIS que o Prisma
   * estiver conectado. Isso corrige o erro "Engine is not yet connected".
   */
  async onModuleInit() {
    this.logger.log('🔌 Conectando ao banco de dados...');
    try {
      await this.$connect();
      this.logger.log('✅ Conexão estabelecida.');
    } catch (error) {
      this.logger.error(
        '❌ Falha crítica ao conectar com o banco na inicialização.',
        error.stack,
      );
      // É uma prática robusta "falhar rápido" (fail-fast)
      // se o banco não estiver disponível no boot.
      process.exit(1);
    }
  }

  /**
   * ROBUSTEZ NO DESLIGAMENTO:
   * Garante que o Prisma feche a conexão graciosamente.
   */
  async onModuleDestroy() {
    this.logger.log('🔌 Fechando conexão com o banco de dados...');
    await this.$disconnect();
  }

  // --- Lógica de Retentativa de Query (Mantida do seu original) ---

  // Helper para esperar
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper para não tentar novamente erros de lógica
  private isNonTransientError(error: any): boolean {
    if (error.code) {
      // Erros de violação de constraint, "não encontrado", etc.
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
   * ROBUSTEZ NAS QUERIES:
   * Esta é sua função original,
   * mas simplificada: ela não precisa mais verificar
   * a conexão (ensureConnected), só precisa tentar
   * a OPERAÇÃO novamente.
   */
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (attempt < this.retryConfig.maxRetries) {
      try {
        // SIMPLES: Apenas executa a operação.
        return await operation();
      } catch (error) {
        attempt++;

        // ROBUSTO: Não tenta novamente erros de lógica de negócio
        if (this.isNonTransientError(error)) {
          this.logger.warn(
            `Erro não-transitório (código: ${error.code}), não tentando novamente.`,
          );
          throw error;
        }

        // ROBUSTO: Desiste após N tentativas
        if (attempt >= this.retryConfig.maxRetries) {
          this.logger.error(
            `❌ Operação falhou após ${attempt} tentativas: ${error.message}`,
          );
          throw error;
        }

        // ROBUSTO: Espera (com backoff) antes de tentar de novo
        const delay = Math.min(
          this.retryConfig.baseDelay * 2 ** (attempt - 1),
          this.retryConfig.maxDelay,
        );

        this.logger.warn(
          `⚠️ Erro transitório. Tentativa ${attempt}/${this.retryConfig.maxRetries} em ${delay}ms... (Erro: ${error.message})`,
        );
        await this.sleep(delay);
      }
    }

    // (Isso nunca deve ser alcançado, mas o TypeScript exige)
    throw new Error('Falha inesperada em executeWithRetry.');
  }
}