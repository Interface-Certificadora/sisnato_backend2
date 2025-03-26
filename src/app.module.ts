import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
// import { SeModule } from './se/se.module';
import { S3Module } from './s3/s3.module';
import { UserModule } from './api/user/user.module';
import { AlertsModule } from './api/alerts/alerts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, S3Module, UserModule, AlertsModule, AuthModule],
})
export class AppModule {}
