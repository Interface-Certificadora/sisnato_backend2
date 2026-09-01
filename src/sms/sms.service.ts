import { Injectable, Logger } from '@nestjs/common';

export interface InovstarTemplateParam {
  type:
    | 'text'
    | 'currency'
    | 'date_time'
    | 'image'
    | 'video'
    | 'document'
    | 'coupon_code';
  text?: string;
  [key: string]: any;
}

export interface InovstarTemplateComponent {
  type: 'HEADER' | 'BODY' | 'BUTTON';
  parameters: InovstarTemplateParam[];
}

export interface InovstarSendResponse {
  msg: string;
  messageId?: string;
  whatsappMessageId?: string;
  chatId: string | null;
  contactId: string | null;
  attendanceId?: string | null;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly apiUrl =
    process.env.WHATSAPP_URL || 'https://gateway.inovstar.com/api';

  private readonly apiToken = process.env.WHATSAPP_KEY || '';

  private readonly channelId = process.env.WHATSAPP_CHANNEL_ID || '';

  private readonly defaultTemplate =
    process.env.WHATSAPP_WELCOME_DEFAULT_TEMPLATE || '';

  /**
   * Cabeçalho de autorização padrão da nova API
   */
  private getHeaders(): Record<string, string> {
    const cleanToken = this.apiToken.startsWith('Bearer ')
      ? this.apiToken
      : `Bearer ${this.apiToken}`;

    return {
      Authorization: cleanToken,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Formata número para padrão internacional (+5511999999999)
   */
  private formatPhoneNumber(telefone: string): string {
    const cleanNumber = telefone.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55')
      ? cleanNumber
      : `55${cleanNumber}`;
    return `+${fullNumber}`;
  }

  /**
   * Helper genérico para envio de template (HSM)
   */
  private async sendTemplateRequest(
    to: string,
    templateName: string,
    bodyParameters: string[],
    clientMessageId?: string,
  ): Promise<InovstarSendResponse> {
    const formattedPhone = this.formatPhoneNumber(to);
    const url = `${this.apiUrl}/whatsapp/send/template`;

    const payload = {
      channelId: this.channelId,
      to: formattedPhone,
      clientMessageId:
        clientMessageId ||
        `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      template: {
        name: templateName,
        language: 'pt_BR',
        components: [
          {
            type: 'BODY',
            parameters: bodyParameters.map((text) => ({
              type: 'text',
              text: text || '',
            })),
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        msg: 'Template enviado com sucesso',
        messageId: data.data?.messageId,
        whatsappMessageId: data.data?.whatsappMessageId,
        chatId: data.data?.attendanceId ?? null,
        contactId: data.data?.contactId ?? null,
        attendanceId: data.data?.attendanceId ?? null,
      };
    }

    const errorDetails = data.error?.details?.metaError
      ? ` [Meta: ${data.error.details.metaError.message || data.error.details.metaError.code}]`
      : '';

    const errorMessage =
      data.error?.message || data.message || `Erro HTTP ${response.status}`;
    this.logger.error(
      `Falha no envio do template (${templateName}) para ${formattedPhone}: ${errorMessage}${errorDetails}`,
    );

    throw new Error(`${errorMessage}${errorDetails}`);
  }

  /**
   * Cria atendimento / Inicia conversa via template WhatsApp
   */
  async cerateChat(
    telefone: string,
    solicitacaoName: string,
    construtoraName: string,
    empreendimentoName: string,
    financieraName: string,
    templateId?: string,
  ): Promise<{ msg: string; chatId: string | null; contactId: string | null }> {
    const finalTemplate = templateId || this.defaultTemplate;
    const result = await this.sendTemplateRequest(telefone, finalTemplate, [
      `*${solicitacaoName}*`,
      `*${construtoraName}*`,
      `*${empreendimentoName}*`,
      `*${financieraName}*`,
    ]);

    return {
      msg: result.msg,
      chatId: result.chatId,
      contactId: result.contactId,
    };
  }

  /**
   * Vincula etiquetas (labels) ao contato
   */
  async addContactLabels(contactId: string, labelIds: string[]): Promise<any> {
    if (!contactId || !labelIds?.length) return null;

    try {
      const url = `${this.apiUrl}/contacts/${contactId}/labels`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ labelIds }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        this.logger.error(
          `Falha ao vincular etiquetas no contato ${contactId}: ${JSON.stringify(data)}`,
        );
      }

      return data;
    } catch (error) {
      this.logger.error(
        `Erro na requisição de etiquetas para contato ${contactId}: ${error.message}`,
      );
    }
  }

  /**
   * Método de compatibilidade: se passar um ID de label em value, vincula a etiqueta
   */
  async setContactAttribute(
    contactId: string,
    key: string,
    value: string,
  ): Promise<any> {
    const labelId = process.env.INOVSTAR_IA_LABEL_ID || value;
    if (labelId && labelId !== 'true' && labelId !== 'false') {
      return this.addContactLabels(contactId, [labelId]);
    }
    this.logger.warn(
      `setContactAttribute chamado para ${contactId}, mas a nova API opera por etiquetas (/contacts/{id}/labels).`,
    );
    return null;
  }

  /**
   * Envia template padrão de solicitação
   */
  async sendSmS(telefone: string, solicitacaoName: string) {
    const templateName =
      process.env.WHATSAPP_DEFAULT_TEMPLATE || this.defaultTemplate;
    const result = await this.sendTemplateRequest(telefone, templateName, [
      `*${solicitacaoName}*`,
    ]);

    return { msg: result.msg };
  }

  /**
   * Envia alerta via template para corretor
   */
  async AlertSms(
    telefone: string,
    nomeCorretor: string,
    nomeSolicitacao: string,
    idSolicitacao: number,
    descricaoAlerta: string,
  ) {
    try {
      const templateName = process.env.WHATSAPP_ALERT_TEMPLATE || '';

      const result = await this.sendTemplateRequest(telefone, templateName, [
        nomeCorretor.trim(),
        `${nomeSolicitacao} (ID: ${idSolicitacao})`,
        descricaoAlerta,
      ]);

      this.logger.log(
        `Alerta enviado com sucesso para ${this.formatPhoneNumber(telefone)}`,
      );
      return { msg: result.msg };
    } catch (error) {
      this.logger.error(`Erro ao enviar AlertSms: ${error.message}`);
      return { msg: 'Falha ao enviar o SMS, mas o sistema continua rodando.' };
    }
  }

  /**
   * Reenvio de mensagem de boas-vindas via template
   */
  async resendWelcomeMessage(
    telefone: string,
    solicitacaoName: string,
    construtoraName: string,
    empreendimentoName: string,
    financeiraName: string,
    templateId?: string,
  ) {
    const finalTemplate = templateId || this.defaultTemplate;
    const result = await this.sendTemplateRequest(telefone, finalTemplate, [
      `*${solicitacaoName}*`,
      `*${construtoraName}*`,
      `*${empreendimentoName}*`,
      `*${financeiraName}*`,
    ]);

    return { msg: result.msg };
  }
}
