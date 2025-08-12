import {
  HttpException,
  Injectable,
} from '@nestjs/common';
import { CreatePixDto } from './dto/create-pix.dto';
import { ErrorPixType } from './entities/erro.pix.entity';
import path from 'path';
import EfiPay from 'sdk-typescript-apis-efi';
import { ErrorService } from 'src/error/error.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PixService {
  constructor(
    private LogError: ErrorService,
    private configService: ConfigService,
  ) { }
  
  options = {
    sandbox: true,
    client_id: this.configService.get<string>('CLIENT_ID'),
    client_secret: this.configService.get<string>('CLIENT_SECRET'),
    certificate: this.configService.get<string>('EFI_PIX_CERT_PATH'),
    cert_base64: false,
  };

  async create(createPixDto: CreatePixDto) {
    const certUser = this.configService.get<string>('EFI_PIX_CERT_PATH');
    const rota = path.join(process.cwd(), certUser);

    this.options.certificate = rota;

    const { cpf, nome, valor } = createPixDto;

    try {
      const body = {
        calendario: { expiracao: 600 },
        devedor: { cpf, nome },
        valor: { original: valor },
        chave: this.configService.get<string>('CHAVE_PIX'),
      };

      const efipay = new EfiPay(this.options);
      const PixPaymentCreate: any = await efipay.pixCreateImmediateCharge(
        null,
        body,
      );

      // const QrCode = await QRCode.toDataURL(PixPaymentCreate.location);
      const QrCode: any = await this.QrCodeEfi(PixPaymentCreate.loc.id);

      const dataPix = {
        ...PixPaymentCreate,
        ...QrCode,
      };
      console.log('🚀 ~ PixService ~ create ~ dataPix:', dataPix);

      return dataPix;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      console.log('🚀 ~ PixService ~ create ~ error:', error);
      const retorno: ErrorPixType = {
        message:
          error.response?.data?.message ||
          error.mensagem ||
          'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    }
  }

  async QrCodeEfi(id: string) {
    const certUser = this.configService.get<string>('EFI_PIX_CERT_PATH');
    const rota = path.join(process.cwd(), certUser);

    this.options.certificate = rota;

    try {
      const params: any = {
        id: id,
      };

      const efipay = new EfiPay(this.options);
      // O método pixGenerateQRCode indica os campos que devem ser enviados e que serão retornados
      const result = await efipay.pixGenerateQRCode(params);

      return result;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      console.log('🚀 ~ PixService ~ QrCode ~ error:', error);
      throw new HttpException({ message: error.message }, 500);
    }
  }

  async PixPaymentStatus(Txid: string) {
      const certUser = this.configService.get<string>('EFI_PIX_CERT_PATH');
      const rota = path.join(process.cwd(), certUser);

      this.options.certificate = rota;

    try {
      const params = {
        txid: Txid,
      };

      const efipay = new EfiPay(this.options);

      // O método pixDetailCharge indica os campos que devem ser enviados e que serão retornados
      const result = await efipay.pixDetailCharge(params);
      return result;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      console.log('🚀 ~ PixService ~ QrCode ~ error:', error);
      throw new HttpException({ message: error.message }, 500);
    }
  }

  async webhookCreate(url: string) {
    try {
      // Cria uma cópia local das opções para evitar modificar o objeto global da classe
      const localOptions = { ...this.options, validateMtls: false };

      console.log('🚀 ~ PixService ~ webhookCreate ~ localOptions:', localOptions);

      const body = {
        webhookUrl: url,
      };

      const params = {
        chave: this.configService.get<string>('CHAVE_PIX'),
      };

      // Usa as opções locais para instanciar o EfiPay
      const efipay = new EfiPay(localOptions);

      const result = await efipay.pixConfigWebhook(params, body);
      return result;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      console.log('🚀 ~ PixService ~ webhookCreate ~ error:', error);
      throw new HttpException({ message: error.message }, 500);
    }
  }
}
