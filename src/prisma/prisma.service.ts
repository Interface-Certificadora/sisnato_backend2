import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private connectionRetryCount = 0;
  private readonly retryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.safeDisconnect();
  }

  private async connectWithRetry(): Promise<void> {
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting database connection (${attempt}/${this.retryConfig.maxRetries})`);
        await this.$connect();
        this.isConnected = true;
        this.connectionRetryCount = 0;
        this.logger.log('Database connected successfully');
        return;
      } catch (error) {
        this.isConnected = false;
        this.logger.error(`Database connection attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.retryConfig.maxRetries) {
          this.logger.error('All database connection attempts failed');
          throw error;
        }
        
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
          this.retryConfig.maxDelay
        );
        
        this.logger.warn(`Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  private async safeDisconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.$disconnect();
        this.isConnected = false;
        this.logger.log('Database disconnected successfully');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error.message);
    }
  }

  async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Database not connected, attempting reconnection...');
      await this.connectWithRetry();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      this.isConnected = true;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        await this.ensureConnection();
        return await operation();
      } catch (error) {
        this.logger.error(`Database operation attempt ${attempt} failed:`, error.message);
        
        if (this.isDatabaseConnectionError(error)) {
          this.isConnected = false;
          
          if (attempt === this.retryConfig.maxRetries) {
            throw new Error('Database unavailable after multiple retry attempts');
          }
          
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
            this.retryConfig.maxDelay
          );
          
          this.logger.warn(`Retrying database operation in ${delay}ms...`);
          await this.sleep(delay);
        } else {
          throw error;
        }
      }
    }
  }

  private isDatabaseConnectionError(error: any): boolean {
    const connectionErrorPatterns = [
      'Engine is not yet connected',
      'Connection is not open',
      'Client has already been connected',
      'Database connection was closed',
      'Connection lost',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND'
    ];
    
    const errorMessage = error?.message || error?.toString() || '';
    return connectionErrorPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get connectionStatus(): boolean {
    return this.isConnected;
  }
}
