import { Module } from '@nestjs/common';
import { RelatorioFinanceiroService } from './relatorio_financeiro.service';
import { RelatorioFinanceiroController } from './relatorio_financeiro.controller';

import { createRabbitMqClient } from './rabbitmq.client';
import { ClientProxy } from '@nestjs/microservices';

@Module({
  controllers: [RelatorioFinanceiroController],
  providers: [
    RelatorioFinanceiroService,
    {
      provide: 'RABBITMQ_SERVICE',
      useFactory: createRabbitMqClient,
    } as { provide: string; useFactory: () => ClientProxy },
  ],
})
export class RelatorioFinanceiroModule {}
