import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as soap from 'soap';

@Injectable()
export class SolutiService {
  private readonly logger = new Logger(SolutiService.name);

  // URL baseada na documentação PHP (que costuma estar correta)
  private readonly WSDL_URL =
    'https://gvshom.ca.inf.br/GVS/webservices/GVSServices.jws?wsdl';

  private readonly USER = process.env.SOLUTI_USER;
  private readonly KEY = process.env.SOLUTI_KEY;

  private async getClient() {
    return await soap.createClientAsync(this.WSDL_URL, {
      disableCache: true,
      forceSoap12Headers: false,
      // IMPORTANTE: O endpoint de envio NÃO pode ter ?wsdl no final
      endpoint: 'https://gvshom.ca.inf.br/GVS/webservices/GVSServices.jws',
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
    try {
      // 1. Gera o Auth (Cria o nonce e calcula o HMAC)
      const auth = this.generateAuth('SITUACAO', { voucher });

      const client = await this.getClient();

      // 2. CORREÇÃO AQUI:
      // O WSDL pede 'Nonce', não 'senha'.
      const args = {
        usuario: this.USER,
        nonce: auth.nonce, // <--- ADICIONADO: O nonce gerado acima
        voucher: voucher,
        Hmac: auth.hmac,
      };

      // Tenta encontrar o método correto (Case Insensitive)
      const method = client.SituacaovoucherAsync || client.situacaovoucherAsync;

      const [result] = await method(args, {
        headers: {
          SOAPAction: 'situacaovoucher',
        },
      });

      return result;
    } catch (e) {
      this.logger.error(
        `Erro Situacao ${voucher}:`,
        e.response?.data || e.message,
      );
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

      // DEBUG: Lista os métodos disponíveis nessa URL
      const description = client.describe();
      const serviceName = Object.keys(description)[0];
      const portName = Object.keys(description[serviceName])[0];
      const methods = Object.keys(description[serviceName][portName]);
      this.logger.debug(
        `Métodos disponíveis em ${this.WSDL_URL}: ${methods.join(', ')}`,
      );

      // Tenta encontrar o método correto (Case Insensitive)
      let methodToCall =
        client.SugestaodeusovoucherAsync || client.sugestaodeusovoucherAsync;

      if (!methodToCall) {
        // Se ainda não existir, throw error para vermos no log
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

      // MOCK TEMPORÁRIO DE SUCESSO (Se quiser testar o fluxo sem a API funcionar)
      // Descomente abaixo se precisar simular sucesso enquanto a Soluti não arruma a API
      /*
      if (e.message.includes('não foi encontrado')) {
          this.logger.warn('Simulando sucesso de Sugestão devido a erro de WSDL.');
          return { status: '10', mensagem: 'Simulado' };
      }
      */

      throw e;
    }
  }
}
