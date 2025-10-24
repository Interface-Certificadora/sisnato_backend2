import { Logger } from '@nestjs/common';

/**
 * A decorator to make a database operation resilient to transient errors.
 * It attempts to use a `executeWithRetry` method if available on the service's `prismaService`.
 * If the method is not available, or an error occurs, it falls back to a default value.
 * @param options - Configuration for the decorator.
 * @param options.context - The context for logging, usually the Service name.
 * @param options.fallbackValue - The value to return if the operation fails.
 */
export function DatabaseResilient(options: {
  context: string;
  fallbackValue: any;
}) {
  const logger = new Logger(options.context);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 'this' refers to the instance of the service (e.g., UserService)
      // It is assumed that the service has a 'prismaService' property.
      const prismaService = this.prismaService;

      // Check if a resilient execution method exists and use it.
      if (
        prismaService &&
        typeof prismaService.executeWithRetry === 'function'
      ) {
        try {
          return await prismaService.executeWithRetry(() =>
            originalMethod.apply(this, args),
          );
        } catch (error) {
          logger.error(
            `Error during resilient execution: ${error.message}`,
            error.stack,
          );
          return options.fallbackValue;
        }
      }

      // Fallback to direct execution if `executeWithRetry` is not available.
      logger.warn(
        `PrismaService does not support executeWithRetry, falling back to direct execution`,
      );
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        logger.error(
          `Error during direct execution: ${error.message}`,
          error.stack,
        );
        return options.fallbackValue;
      }
    };

    return descriptor;
  };
}
