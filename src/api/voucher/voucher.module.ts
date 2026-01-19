import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SolutiModule } from 'src/soluti/soluti.module';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';

@Module({
  imports: [PrismaModule, SolutiModule],
  controllers: [VoucherController],
  providers: [VoucherService, FcwebProvider],
  exports: [VoucherService],
})
export class VoucherModule {}
