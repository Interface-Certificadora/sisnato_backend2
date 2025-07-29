import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseFallbackHelper } from './helpers/database-fallback.helper';

@Global()
@Module({
  providers: [PrismaService, DatabaseFallbackHelper],
  exports: [PrismaService, DatabaseFallbackHelper],
})
export class PrismaModule {}
