// prisma/prisma.service.ts (ou renomeie para prisma-manager.service.ts)

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type ClientType = 'write' | 'read';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // NÃO estende mais PrismaClient
  private readonly logger = new Logger(PrismaService.name);

  // Instâncias separadas para escrita e leitura
  private prismaWrite: PrismaClient;
  private prismaRead: PrismaClient;

  // Status de conexão separados
  private isWriteConnected = false;
  private isReadConnected = false;

  private readonly retryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  constructor() {
    // Instancia os dois clientes com suas respectivas URLs
    this.prismaWrite = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL_WRITE } },
    });
    this.prismaRead = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL_READ } },
    });
  }

  // Getters públicos para acessar os clientes de forma segura
  public get write(): PrismaClient {
    if (!this.isWriteConnected) {
      this.logger.warn('Acesso ao cliente de escrita enquanto desconectado.');
    }
    return this.prismaWrite;
  }

  public get read(): PrismaClient {
    if (!this.isReadConnected) {
      this.logger.warn('Acesso ao cliente de leitura enquanto desconectado.');
    }
    return this.prismaRead;
  }

  async onModuleInit() {
    this.logger.log('Inicializando conexões com o banco de dados...');
    // Conecta ambos em paralelo
    await Promise.all([
      this.connectWithRetry('write'),
      this.connectWithRetry('read'),
    ]);
  }

  async onModuleDestroy() {
    this.logger.log('Fechando conexões com o banco de dados...');
    // Desconecta ambos em paralelo
    await Promise.all([
      this.safeDisconnect('write'),
      this.safeDisconnect('read'),
    ]);
  }

  // O método agora aceita o tipo de cliente como parâmetro
  private async connectWithRetry(clientType: ClientType): Promise<void> {
    const client = clientType === 'write' ? this.prismaWrite : this.prismaRead;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.logger.log(
          `[${clientType}] Tentando conectar (${attempt}/${this.retryConfig.maxRetries})`,
        );
        await client.$connect();

        if (clientType === 'write') this.isWriteConnected = true;
        else this.isReadConnected = true;

        this.logger.log(`[${clientType}] Conexão estabelecida com sucesso!`);
        return;
      } catch (error) {
        this.logger.error(
          `[${clientType}] Falha na tentativa de conexão ${attempt}:`,
          error.message,
        );

        if (attempt === this.retryConfig.maxRetries) {
          this.logger.error(
            `[${clientType}] Todas as tentativas de conexão falharam.`,
          );
          // Em um app real, você pode querer parar a aplicação aqui
          throw error;
        }

        const delay = Math.min(
          this.retryConfig.baseDelay * 2 ** (attempt - 1),
          this.retryConfig.maxDelay,
        );
        this.logger.warn(`[${clientType}] Tentando novamente em ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  private async safeDisconnect(clientType: ClientType): Promise<void> {
    const client = clientType === 'write' ? this.prismaWrite : this.prismaRead;
    const isConnected =
      clientType === 'write' ? this.isWriteConnected : this.isReadConnected;

    try {
      if (isConnected) {
        await client.$disconnect();
        if (clientType === 'write') this.isWriteConnected = false;
        else this.isReadConnected = false;
        this.logger.log(`[${clientType}] Conexão fechada com sucesso.`);
      }
    } catch (error) {
      this.logger.error(
        `[${clientType}] Erro ao fechar conexão:`,
        error.message,
      );
    }
  }

  async healthCheck(clientType: ClientType): Promise<boolean> {
    const client = clientType === 'write' ? this.prismaWrite : this.prismaRead;

    try {
      await client.$queryRaw`SELECT 1`;
      if (clientType === 'write') this.isWriteConnected = true;
      else this.isReadConnected = true;
      return true;
    } catch (error) {
      this.logger.error(`[${clientType}] Health check falhou:`, error.message);
      if (clientType === 'write') this.isWriteConnected = false;
      else this.isReadConnected = false;
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async ensureConnected(clientType: ClientType) {
    try {
      const client =
        clientType === 'write' ? this.prismaWrite : this.prismaRead;
      await client.$connect();
    } catch (error) {
      throw new Error(
        'Falha na conexão com o banco de dados: ' + error.message,
      );
    }
  }

  // Sobrecargas para suportar tanto callback quanto (clientType, methodPath, ...args)
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T>;
  async executeWithRetry<T>(
    clientType: ClientType,
    methodPath: string,
    ...args: any[]
  ): Promise<T>;
  async executeWithRetry<T>(
    first: ClientType | (() => Promise<T>),
    second?: string,
    ...args: any[]
  ): Promise<T> {
    // Caso 1: execução via callback (usado pelo decorator DatabaseResilient)
    if (typeof first === 'function') {
      const operation = first as () => Promise<T>;
      let attempt = 0;
      while (attempt < this.retryConfig.maxRetries) {
        try {
          return await operation();
        } catch (error) {
          attempt++;
          // Erros não transitórios não devem fazer retry
          if (this.isNonTransientError(error) || attempt >= this.retryConfig.maxRetries) {
            throw error;
          }
          const delay = Math.min(
            this.retryConfig.baseDelay * 2 ** (attempt - 1),
            this.retryConfig.maxDelay,
          );
          this.logger.warn(`Retry (callback) ${attempt}/${this.retryConfig.maxRetries} em ${delay}ms: ${error?.message}`);
          await this.sleep(delay);
        }
      }
      // TypeScript exige retorno; fluxo nunca deve chegar aqui
      throw new Error('Falha inesperada em executeWithRetry (callback).');
    }

    // Caso 2: execução via (clientType, methodPath, ...args)
    const clientType = first as ClientType;
    const methodPath = second as string;
    await this.ensureConnected(clientType);
    const client = clientType === 'write' ? this.prismaWrite : this.prismaRead;
    const pathParts = methodPath.split('.');

    let methodParent: any = client;
    for (let i = 0; i < pathParts.length - 1; i++) {
      methodParent = methodParent[pathParts[i]];
    }

    const finalMethodName = pathParts[pathParts.length - 1];
    const methodToCall = methodParent[finalMethodName];

    if (typeof methodToCall !== 'function') {
      throw new TypeError(
        `Método '${methodPath}' não é uma função no cliente Prisma.`,
      );
    }

    return methodToCall.apply(methodParent, args);
  }

  async readUserFindFirst(...args: any[]) {
    return this.executeWithRetry('read', 'user.findFirst', ...args);
  }

  async writeUserFindFirst(...args: any[]) {
    return this.executeWithRetry('write', 'user.findFirst', ...args);
  }

  /**
   * Determines if an error is non-transient and should not be retried.
   * @param error - The error to check
   * @returns true if the error is non-transient
   */
  private isNonTransientError(error: any): boolean {
    // Check for validation errors, constraint violations, etc.
    if (error.code) {
      const nonTransientCodes = [
        'P2002', // Unique constraint violation
        'P2003', // Foreign key constraint violation
        'P2004', // Constraint violation
        'P2025', // Record not found
      ];
      return nonTransientCodes.includes(error.code);
    }

    return false;
  }
}
