import {
  HttpException,
  HttpVersionNotSupportedException,
  Injectable,
} from '@nestjs/common';
import { CreatePixDto } from './dto/create-pix.dto';
import { UpdatePixDto } from './dto/update-pix.dto';
import { ErrorPixType } from './entities/erro.pix.entity';
import path from 'path';
import EfiPay from 'sdk-typescript-apis-efi';
import { ErrorService } from 'src/error/error.service';

@Injectable()
export class PixService {
  constructor(private LogError: ErrorService) {}
  async create(createPixDto: CreatePixDto) {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const certUser = process.env.EFI_PIX_CERT_PATH;

    const rota = path.join(process.cwd(), certUser);

    const Option = {
      sandbox: true,
      client_id: clientId,
      client_secret: clientSecret,
      certificate: rota,
      cert_base64: false,
    };

    const { cpf, nome, valor } = createPixDto;

    try {
      const body = {
        calendario: { expiracao: 600 },
        devedor: { cpf, nome },
        valor: { original: valor },
        chave: process.env.CHAVE_PIX,
        //passar url de retorno
        urlRetorno: 'https://apiv2.sisnato.com.br/pix',
        // urlRetorno: 'https://www.sisnato.com.br/pix',
      };

      const efipay = new EfiPay(Option);
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
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const certUser = process.env.EFI_PIX_CERT_PATH;

    const rota = path.join(process.cwd(), certUser);

    const Option = {
      sandbox: true,
      client_id: clientId,
      client_secret: clientSecret,
      certificate: rota,
      cert_base64: false,
    };

    try {
      const params: any = {
        id: id,
      };

      const efipay = new EfiPay(Option);
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
    // const clientId = process.env.CLIENT_ID;
    // const clientSecret = process.env.CLIENT_SECRET;
    // const certUser = process.env.EFI_PIX_CERT_PATH;

    const clientId = process.env.CLIENT_ID_SANDBOX;
    const clientSecret = process.env.CLIENT_SECRET_SANDBOX;
    const certUser = process.env.CERT_USER_SANDBOX;

    const rota = path.join(process.cwd(), certUser);

    const Option = {
      sandbox: true,
      client_id: clientId,
      client_secret: clientSecret,
      certificate: rota,
      cert_base64: false,
    };

    try {
      const params = {
        txid: Txid,
      };

      const efipay = new EfiPay(Option);

      // O método pixDetailCharge indica os campos que devem ser enviados e que serão retornados
      const result = await efipay.pixDetailCharge(params);
      return result;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      console.log('🚀 ~ PixService ~ QrCode ~ error:', error);
      throw new HttpException({ message: error.message }, 500);
    }
  }

 
}
