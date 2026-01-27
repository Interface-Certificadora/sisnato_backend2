import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as soap from 'soap';

@Injectable()
export class SolutiService {
  private readonly logger = new Logger(SolutiService.name);

  private readonly WSDL_URL =
    'https://gvs.ca.inf.br/GVS/webservices/GVSServices.jws?wsdl';

  private readonly USER = process.env.SOLUTI_USER;
  private readonly KEY = process.env.SOLUTI_KEY;

  private async getClient() {
    // Adicionamos timeout para não travar a aplicação
    return await soap.createClientAsync(this.WSDL_URL, {
      disableCache: true,
      forceSoap12Headers: false,
      endpoint: 'https://gvs.ca.inf.br/GVS/webservices/GVSServices.jws',
      wsdl_options: {
        timeout: 10000, // 10 segundos de limite
      },
    });
  }

  private generateAuth(
    tipo: 'GET' | 'SITUACAO' | 'SUGESTAO' | 'REMOVER',
    params: any,
  ) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    const nonce = timestamp + random;

    const hkey = nonce + this.KEY;
    const hash_hkey = crypto.createHash('sha256').update(hkey).digest('hex');

    let dados = '';

    if (tipo === 'GET') {
      dados =
        this.USER +
        nonce +
        (params.codproduto || '') +
        (params.codvenda || '') +
        (params.sugestao || '') +
        (params.cpfcnpj || '') +
        (params.restrito || '') +
        (params.serial || '') +
        (params.email || '');
    } else if (tipo === 'SITUACAO') {
      dados = this.USER + nonce + params.voucher;
    } else if (tipo === 'SUGESTAO') {
      dados =
        this.USER +
        nonce +
        params.voucher +
        params.nome +
        params.cpfcnpj +
        params.restrito;
    } else if (tipo === 'REMOVER') {
      dados = this.USER + nonce + params.voucher;
    }

    const hash_hkey_dados = crypto
      .createHash('sha256')
      .update(hkey + dados)
      .digest('hex');

    const hmac = crypto
      .createHash('sha256')
      .update(hash_hkey + hash_hkey_dados)
      .digest('hex');

    return { nonce, hmac };
  }

  // --- 1. GET VOUCHER ---
  async getVoucher(dados: {
    codproduto: string;
    codvenda: string;
    sugestao?: string;
    cpfcnpj?: string;
  }) {
    try {
      const restrito = 'false';
      const auth = this.generateAuth('GET', {
        ...dados,
        restrito,
        serial: '',
        email: '',
      });

      const client = await this.getClient();

      const args = {
        usuario: this.USER,
        nonce: auth.nonce,
        codproduto: dados.codproduto,
        codvenda: dados.codvenda,
        sugestao: dados.sugestao || '',
        'cpf-cnpj': dados.cpfcnpj || '',
        restrito: restrito,
        hmac: auth.hmac,
        serial: '',
        Emailcliente: '',
      };

      const [result] = await client.GetvoucherAsync(args);
      this.logger.log(`GetVoucher: ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      this.logger.error('Erro GetVoucher', e);
      throw e;
    }
  }

  // --- 2. SITUACAO VOUCHER ---
  async consultarSituacao(voucher: string) {
    const startTime = Date.now();
    try {
      this.logger.log(
        `🔍 [SolutiService] Iniciando consulta para voucher: ${voucher}`,
      );

      const auth = this.generateAuth('SITUACAO', { voucher });

      this.logger.debug(
        `🔑 [SolutiService] Auth gerado. Criando cliente SOAP...`,
      );
      const client = await this.getClient();

      const args = {
        usuario: this.USER,
        nonce: auth.nonce,
        voucher: voucher,
        Hmac: auth.hmac,
      };

      const method = client.SituacaovoucherAsync || client.situacaovoucherAsync;

      this.logger.log(
        `🚀 [SolutiService] Enviando requisição SOAP para ${this.WSDL_URL}...`,
      );

      const [result] = await method(args, {
        headers: { SOAPAction: 'situacaovoucher' },
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ [SolutiService] Resposta recebida em ${duration}ms: ${JSON.stringify(result)}`,
      );

      return result;
    } catch (e) {
      const duration = Date.now() - startTime;
      const erroMsg = e.message || 'Erro desconhecido';

      this.logger.error(
        `❌ [SolutiService] Erro após ${duration}ms. Voucher: ${voucher}`,
      );
      this.logger.error(`❌ Detalhes do erro: ${erroMsg}`);

      // Verifica especificamente erro de conexão
      if (erroMsg.includes('ETIMEDOUT') || erroMsg.includes('ECONNREFUSED')) {
        this.logger.error(
          `🚨 ERRO DE REDE: O servidor não conseguiu conectar na Soluti. Verifique se o IP está liberado no Firewall deles.`,
        );
      }

      return null;
    }
  }

  // --- 3. INSERIR SUGESTAO ---
  async inserirSugestao(voucher: string, nome: string, cpf: string) {
    try {
      const restrito = 'false';
      const auth = this.generateAuth('SUGESTAO', {
        voucher,
        nome,
        cpfcnpj: cpf,
        restrito,
      });

      const client = await this.getClient();

      const description = client.describe();
      const serviceName = Object.keys(description)[0];
      const portName = Object.keys(description[serviceName])[0];
      const methods = Object.keys(description[serviceName][portName]);
      this.logger.debug(
        `Métodos disponíveis em ${this.WSDL_URL}: ${methods.join(', ')}`,
      );

      let methodToCall =
        client.SugestaodeusovoucherAsync || client.sugestaodeusovoucherAsync;

      if (!methodToCall) {
        throw new Error(
          `O método 'sugestaodeusovoucher' não foi encontrado no WSDL. Métodos: ${methods.join(', ')}`,
        );
      }

      const args = {
        usuario: this.USER,
        senha: this.KEY,
        voucher: voucher,
        sugestao: nome,
        'cpf-cnpj': cpf,
        restrito: restrito,
        Hmac: auth.hmac,
      };

      const [result] = await methodToCall(args);
      return result;
    } catch (e) {
      this.logger.error(`Erro Sugestao ${voucher}`, e.message);
      throw e;
    }
  }
}
