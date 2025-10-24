import { Injectable, Logger } from '@nestjs/common';

export interface FallbackConfig {
  enableFallback: boolean;
  cacheTimeout: number;
  defaultResponses: {
    userRole: any;
    emptyList: any[];
    notFound: null;
  };
}

@Injectable()
export class DatabaseFallbackHelper {
  private readonly logger = new Logger(DatabaseFallbackHelper.name);
  private readonly cache = new Map<string, { data: any; timestamp: number }>();

  private readonly config: FallbackConfig = {
    enableFallback: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    defaultResponses: {
      userRole: {
        id: null,
        role: 'USER',
        hierarquia: 'CONSULTOR',
        empreendimentos: [],
        message: 'Dados indisponíveis temporariamente',
      },
      emptyList: [],
      notFound: null,
    },
  };

  setCacheItem(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getCacheItem(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  getUserRoleFallback(userId: number): any {
    const cachedData = this.getCacheItem(`userRole:${userId}`);
    if (cachedData) {
      this.logger.warn(`Returning cached user role for user ${userId}`);
      return cachedData;
    }

    this.logger.warn(`Returning default user role fallback for user ${userId}`);
    return {
      ...this.config.defaultResponses.userRole,
      id: userId,
    };
  }

  getEmptyListFallback(listType: string): any[] {
    this.logger.warn(`Returning empty list fallback for ${listType}`);
    return this.config.defaultResponses.emptyList;
  }

  getNotFoundFallback(entityType: string, entityId: any): null {
    this.logger.warn(
      `Returning not found fallback for ${entityType} with id ${entityId}`,
    );
    return this.config.defaultResponses.notFound;
  }

  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackFn: () => T,
    cacheKey?: string,
  ): Promise<T> {
    try {
      const result = await operation();

      if (cacheKey && result) {
        this.setCacheItem(cacheKey, result);
      }

      return result;
    } catch (error) {
      if (this.config.enableFallback) {
        this.logger.error(
          `Database operation failed, using fallback:`,
          error.message,
        );
        return fallbackFn();
      }
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  enableFallback(enable: boolean): void {
    this.config.enableFallback = enable;
    this.logger.log(`Fallback ${enable ? 'enabled' : 'disabled'}`);
  }
}
