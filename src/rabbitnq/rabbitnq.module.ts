import { Global, Module } from '@nestjs/common';
import { RabbitnqService } from './rabbitnq.service';
import { QUEUE_NAME } from './rabbitnq.constants';

@Global()
@Module({
  providers: [
    RabbitnqService,
    {
      provide: QUEUE_NAME,
      useValue: 'sisnato', // Nome da fila padrão
    },
  ],
  exports: [RabbitnqService],
})
export class RabbitnqModule {}
