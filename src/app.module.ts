import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
// import { SeModule } from './se/se.module';
import { S3Module } from './s3/s3.module';
import { UserModule } from './api/user/user.module';

@Module({
  imports: [PrismaModule, S3Module, UserModule],
})
export class AppModule {}
