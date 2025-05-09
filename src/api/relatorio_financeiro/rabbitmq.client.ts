// rabbitmq.client.ts
// Cliente RabbitMQ configurado para ser reutilizado via injeção de dependência
// Clean Code: nomes claros, comentários didáticos, responsabilidade única

import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';

/**
 * Função responsável por criar e exportar o client RabbitMQ já configurado.
 * Pode ser usada como provider no módulo.
 */
export function createRabbitMqClient(): ClientProxy {
  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://interface:interface123%21%40%23@24.152.37.153:5672'], // URL do RabbitMQ
      queue: 'sisnato', // Nome da fila utilizada
      queueOptions: { durable: false },
    },
  });
}
