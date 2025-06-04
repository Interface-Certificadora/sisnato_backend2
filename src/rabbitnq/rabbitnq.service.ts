import { Injectable, Inject } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { QUEUE_NAME } from './rabbitnq.constants';

/**
 * Serviço responsável por gerenciar a conexão e envio de mensagens para o RabbitMQ.
 * O nome da fila é injetado via provider, seguindo boas práticas de Clean Code e SOLID.
 */
@Injectable()
export class RabbitnqService {
  private readonly rabbitmqClient: ClientProxy;
  private readonly Url: string =
    process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  constructor(@Inject(QUEUE_NAME) private readonly Queue: string) {
    this.rabbitmqClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.Url],
        queue: this.Queue,
        queueOptions: { durable: false },
      },
    });
  }

  /**
   * Envia uma mensagem para a fila RabbitMQ.
   * @param event Nome do evento/routing key.
   * @param payload Dados a serem enviados.
   */
  async send(event: string, payload: any) {
    await this.rabbitmqClient.emit(event, payload).toPromise();
  }
}
