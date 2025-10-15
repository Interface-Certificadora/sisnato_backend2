import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const status = this.prisma.getConnectionStatus();
    const health = await this.prisma.healthCheck();
    
    return {
      status: health.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        connected: health.connected,
        connecting: status.connecting,
        error: health.error,
        connection: 'PostgreSQL via PgBouncer',
        port: 6432,
      },
      application: {
        status: 'running', // App sempre roda, mesmo sem DB
      },
    };
  }

  @Get('db-stats')
  async dbStats() {
    const stats = await this.prisma.getConnectionStats();
    
    if (!stats) {
      throw new HttpException(
        'Database não disponível',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    
    return {
      database: stats,
      pgbouncer: {
        enabled: true,
        port: 6432,
        mode: 'transaction',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('liveness')
  liveness() {
    // Sempre retorna OK - app está vivo
    return { status: 'ok' };
  }

  @Get('readiness')
  async readiness() {
    // Só retorna OK se DB está disponível
    const health = await this.prisma.healthCheck();
    
    if (!health.connected) {
      throw new HttpException(
        'Database não disponível',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    
    return { status: 'ok', database: 'ready' };
  }
}
