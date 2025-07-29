import { Logger } from '@nestjs/common';

interface DatabaseResilientOptions {
  fallbackValue?: any;
  logErrors?: boolean;
  context?: string;
}

export function DatabaseResilient(options: DatabaseResilientOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}.${propertyName}`);

    descriptor.value = async function (...args: any[]) {
      const prismaService = this.prismaService || this.prisma || this.Prisma;
      
      if (!prismaService) {
        const error = new Error('PrismaService not found in class. Make sure to inject it as prismaService, prisma, or Prisma');
        logger.error(error.message);
        throw error;
      }

      const context = options.context || `${target.constructor.name}.${propertyName}`;

      try {
        if (typeof prismaService.executeWithRetry === 'function') {
          return await prismaService.executeWithRetry(async () => {
            return await originalMethod.apply(this, args);
          });
        } else {
          logger.warn('PrismaService does not support executeWithRetry, falling back to direct execution');
          return await originalMethod.apply(this, args);
        }
      } catch (error) {
        if (options.logErrors !== false) {
          logger.error(`Database operation failed in ${context}:`, error.message);
        }

        if (options.fallbackValue !== undefined) {
          logger.warn(`Returning fallback value for ${context}`);
          return options.fallbackValue;
        }

        throw error;
      }
    };

    return descriptor;
  };
}

export function DatabaseHealthCheck() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}.${propertyName}`);

    descriptor.value = async function (...args: any[]) {
      const prismaService = this.prismaService || this.prisma || this.Prisma;
      
      if (!prismaService) {
        throw new Error('PrismaService not found in class');
      }

      try {
        if (typeof prismaService.healthCheck === 'function') {
          const isHealthy = await prismaService.healthCheck();
          if (!isHealthy) {
            throw new Error('Database health check failed');
          }
        }

        return await originalMethod.apply(this, args);
      } catch (error) {
        logger.error(`Database health check or operation failed:`, error.message);
        throw error;
      }
    };

    return descriptor;
  };
}