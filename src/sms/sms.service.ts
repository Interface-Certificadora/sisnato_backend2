import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

type MetadataProps = {
  url?: string;
  fileName: string;
  extension: string;
};
@Injectable()
export class SmsService {
  private readonly whatsappUrl =
    process.env.WHATSAPP_URL || 'https://api.inovstar.com/core/v2/api';
  private readonly whatsappKey = process.env.WHATSAPP_KEY || '';
  private readonly sectorId = process.env.WHATSAPP_SECTOR_ID || '';
  private readonly defaultTemplate =
    process.env.WHATSAPP_WELCOME_DEFAULT_TEMPLATE || '';
  constructor() {}
  private readonly INOVSTAR_TOKEN = process.env.INOVSTAR_TOKEN;
  private readonly INOVSTAR_URL =
    'https://api.inovstar.com/core/v2/api/chats/send-text';

  private readonly logger = new Logger(SmsService.name);

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
    templateId?: string,
  ) {
    const finalTemplate = templateId || this.defaultTemplate;
    const response = await fetch(`${this.whatsappUrl}/chats/create-new`, {
      method: 'POST',
      headers: {
        'access-token': process.env.WHATSAPP_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: `55${telefone.replace(/\D/g, '')}`,
        sectorId: this.sectorId,
        templateId: finalTemplate,
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
    });
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
    const response = await fetch(`${this.whatsappUrl}/chats/send-template`, {
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
    });
    const data = await response.json();
    console.log('🚀 ~ SmsService ~ sendSms ~ data:', data);
    if (response.ok || data.status === '202') {
      return { msg: data.msg };
    }
    throw new Error(data.msg ?? `Erro ${response.status}`);
  }

  async AlertSms(
    telefone: string,
    nomeCorretor: string,
    nomeSolicitacao: string,
    idSolicitacao: number,
    descricaoAlerta: string,
  ) {
    try {
      const numeroLimpo = telefone.replace(/\D/g, '');

      // Montagem da mensagem com a descrição inclusa
      const mensagem =
        `*NOVO ALERTA* 📢\n\n` +
        `Olá *${nomeCorretor.trim()}*,\n\n` +
        `Existe uma nova atualização na solicitação:\n` +
        `📂 *${nomeSolicitacao}* (ID: ${idSolicitacao})\n\n` +
        `📝 *Descrição:* \n_${descricaoAlerta}_\n\n` +
        `💻 _Por favor, verifique o sistema para mais detalhes._`;

      const data = {
        number: '55' + numeroLimpo,
        message: mensagem,
        forceSend: true,
        verifyContact: true,
      };

      const response = await axios.post(this.INOVSTAR_URL, data, {
        headers: {
          'access-token': this.INOVSTAR_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`WhatsApp enviado para ${numeroLimpo}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro Inovstar: ${error.message}`);
    }
  }

  async resendWelcomeMessage(
    telefone: string,
    solicitacaoName: string,
    construtoraName: string,
    empreendimentoName: string,
    financeiraName: string,
    templateId?: string,
  ) {
    const finalTemplate = templateId || this.defaultTemplate;
    const response = await fetch(`${this.whatsappUrl}/chats/send-template`, {
      method: 'POST',
      headers: {
        'access-token': this.whatsappKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: `55${telefone.replace(/\D/g, '')}`,
        templateId: finalTemplate,
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
    });
    const data = await response.json();
    if (response.ok || data.status === '202') return { msg: data.msg };
    throw new Error(data.msg ?? `Erro ${response.status}`);
  }
}
