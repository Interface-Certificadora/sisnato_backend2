import { Injectable } from '@nestjs/common';

type MetadataProps = {
  url?: string;
  fileName: string;
  extension: string;
};
@Injectable()
export class SmsService {
  constructor() {}

  /**
   * Cria um novo chat via API externa do WhatsApp (Inovstar) para contato com o cliente
   * referente a uma solicitação específica, vinculando os dados da construtora,
   * empreendimento e financeira.
   *
   * @param telefone Número de telefone do cliente (pode conter caracteres não numéricos, que serão removidos)
   * @param solicitacaoName Nome ou identificador da solicitação que será exibido na mensagem
   * @param construtoraName Nome da construtora responsável pelo empreendimento
   * @param empreendimentoName Nome da cidade do emprendimento
   * @param financeiraName Nome da instituição financeira associada à operação
   * @returns Retorna um objeto com a mensagem de resposta da API ({ msg: string }) em caso de sucesso
   * @throws Lança um erro contendo a mensagem retornada pela API ou o status HTTP em caso de falha
   */
  async cerateChat(
    telefone: string,
    solicitacaoName: string,
    construtoraName: string,
    empreendimentoName: string,
    financeiraName: string,
  ) {
    const response = await fetch(
      'https://api.inovstar.com/core/v2/api/chats/create-new',
      {
        method: 'POST',
        headers: {
          'access-token': process.env.WHATSAPP_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: `55${telefone.replace(/\D/g, '')}`,
          sectorId: '60de0c8bb0012f1e6ac55473',
          templateId: '691c96fce6491c672906976f',
          templateComponents: [
            {
              type: 'BODY',
              parameters: [
                {
                  Type: 'text',
                  Text: `*${solicitacaoName}*`,
                },
                {
                  Type: 'text',
                  Text: `*${construtoraName}*`,
                },
                {
                  Type: 'text',
                  Text: `*${empreendimentoName}*`,
                },
                {
                  Type: 'text',
                  Text: `*${financeiraName}*`,
                },
              ],
              index: 0,
            },
          ],
          forceSend: true,
          verifyContact: true,
          useMmLiteApi: true,
        }),
      },
    );
    const data = await response.json();
    console.log('🚀 ~ SmsService ~ sendSms ~ data:', data);
    if (response.ok || data.status === '202') {
      return { msg: data.msg };
    }
    throw new Error(data.msg ?? `Erro ${response.status}`);
  }

  /**
   * Envia uma mensagem via template WhatsApp (Inovstar) para o cliente,
   * relacionada a uma solicitação específica, utilizando o serviço externo da API.
   *
   * @param telefone Número de telefone do cliente (pode conter caracteres não numéricos, que serão removidos)
   * @param solicitacaoName Nome ou identificador da solicitação que será exibido na mensagem
   * @returns Retorna um objeto com a mensagem de resposta da API ({ msg: string }) em caso de sucesso
   * @throws Lança um erro contendo a mensagem retornada pela API ou o status HTTP em caso de falha
   */
  async sendSmS(telefone: string, solicitacaoName: string) {
    const response = await fetch(
      'https://api.inovstar.com/core/v2/api/chats/send-template',
      {
        method: 'POST',
        headers: {
          'access-token': process.env.WHATSAPP_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: `55${telefone.replace(/\D/g, '')}`,
          templateId: '691b8b0fab3265d019cd6ace',
          templateComponents: [
            {
              type: 'BODY',
              parameters: [
                {
                  Type: 'text',
                  Text: `*${solicitacaoName}*`,
                },
              ],
              index: 0,
            },
          ],
          forceSend: true,
          verifyContact: true,
          useMmLiteApi: true,
        }),
      },
    );
    const data = await response.json();
    console.log('🚀 ~ SmsService ~ sendSms ~ data:', data);
    if (response.ok || data.status === '202') {
      return { msg: data.msg };
    }
    throw new Error(data.msg ?? `Erro ${response.status}`);
  }

  async AlertSms(
    telefone: string,
    corretor: string,
    cliente: string,
    id: number,
  ) {
    console.log('telefone', telefone);
    console.log('corretor', corretor);
    console.log('cliente', cliente);
    console.log('id', id);
    // const response = await fetch(
    //   'https://api.inovstar.com/core/v2/api/chats/send-template',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'access-token': process.env.WHATSAPP_KEY || '',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       number: `55${telefone.replace(/\D/g, '')}`,
    //       templateId: "691b8b0fab3265d019cd6ace",
    //       templateComponents: [
    //         {
    //           type: "BODY",
    //           parameters: [
    //             {
    //               Type: "text",
    //               Text: `${corretor}`
    //             },
    //             {
    //               Type: "text",
    //               Text: `${cliente}`
    //             },
    //             {
    //               Type: "text",
    //               Text: `${id}`
    //             },
    //           ],
    //           index: 0
    //         }
    //       ],
    //       forceSend: true,
    //       verifyContact: true,
    //       useMmLiteApi: true
    //     }),
    //   },
    // );
    // const data = await response.json();
    // console.log('🚀 ~ SmsService ~ sendSms ~ data:', data);
    // if (response.ok || data.status === '202') {
    //   return { msg: data.msg };
    // }
    // throw new Error(data.msg ?? `Erro ${response.status}`);
  }

  async resendWelcomeMessage(
    telefone: string,
    solicitacaoName: string,
    construtoraName: string,
    empreendimentoName: string,
    financeiraName: string,
  ) {
    const response = await fetch(
      'https://api.inovstar.com/core/v2/api/chats/send-template',
      {
        method: 'POST',
        headers: {
          'access-token': process.env.WHATSAPP_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: `55${telefone.replace(/\D/g, '')}`,
          templateId: '691c96fce6491c672906976f',
          templateComponents: [
            {
              type: 'BODY',
              parameters: [
                { Type: 'text', Text: `*${solicitacaoName}*` },
                { Type: 'text', Text: `*${construtoraName}*` },
                { Type: 'text', Text: `*${empreendimentoName}*` },
                { Type: 'text', Text: `*${financeiraName}*` },
              ],
              index: 0,
            },
          ],
          forceSend: true,
          verifyContact: true,
          useMmLiteApi: true,
        }),
      },
    );
    const data = await response.json();
    if (response.ok || data.status === '202') {
      return { msg: data.msg };
    }
    throw new Error(data.msg ?? `Erro ${response.status}`);
  }
}
