// rabbitmq.client.ts
// Cliente RabbitMQ configurado para ser reutilizado via injeção de dependência
// Clean Code: nomes claros, comentários didáticos, responsabilidade única

import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';

/**
 * Função responsável por criar e exportar o client RabbitMQ já configurado.
 * Pode ser usada como provider no módulo.
 */
export function createRabbitMqClient(): ClientProxy {
  const url = process.env.RABBITMQ_URL;
  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [url], // URL do RabbitMQ
      queue: 'sisnato', // Nome da fila utilizada
      queueOptions: { durable: false },
    },
  });
}
