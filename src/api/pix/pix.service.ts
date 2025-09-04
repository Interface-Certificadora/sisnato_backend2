import {
  HttpException,
  Injectable,
} from '@nestjs/common';
import { CreatePixDto } from './dto/create-pix.dto';
import { FindAllPixQueryDto } from './dto/find-all-pix-query.dto';
import { ErrorPixType } from './entities/erro.pix.entity';
import path from 'path';
import EfiPay from 'sdk-typescript-apis-efi';
import { ErrorService } from 'src/error/error.service';
import { ConfigService } from '@nestjs/config';
import { URLSearchParams } from 'url';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PixService {
  constructor(
    private LogError: ErrorService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  options = {
    sandbox:
      this.configService.get<string>('EFI_AMBIENT') === 'sandbox'
        ? true
        : false,
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

      const horario = result.pix[0].horario;
      // o horario vem em formato de isso, 2025-09-03T17:12:40.000Z, transformar para data sao paulo -03:00
      const HorarioCorrigido = new Date(horario);
      HorarioCorrigido.setHours(HorarioCorrigido.getHours() - 3);

      const solicitacao = await this.prismaService.read.solicitacao.findFirst({
        where: {
          txid: Txid,
        },
        select: {
          id: true,
        },
      });

      if (result.status === 'CONCLUIDA') {
        await this.prismaService.write.solicitacao.update({
          where: {
            id: solicitacao.id,
          },
          data: {
            pg_date: HorarioCorrigido,
            pg_andamento: 'PAGO',
            pg_status: true,
            situacao_pg: 3,
            estatos_pgto: 'pago',
          },
        });
      }

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

      const body = {
        webhookUrl: url,
      };

      const params = {
        chave: this.configService.get<string>('CHAVE_PIX'),
      };

      // Usa as opções locais para instanciar o EfiPay
      const efipay = new EfiPay(localOptions);

      const result = await efipay.pixConfigWebhook(params, body);
      console.log('🚀 ~ PixService ~ webhookCreate ~ result:', result);
      return {
        message: 'Webhook configurado com sucesso',
        data: {
          ...result,
        },
      };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      console.log('🚀 ~ PixService ~ webhookCreate ~ error:', error);
      throw new HttpException(
        error.nome
          ? JSON.stringify(error, null, 2)
          : { message: error.mensagem },
        error.codigo ? error.codigo : 500,
      );
    }
  }

  async findAll(params: FindAllPixQueryDto) {
    try {
      let url = 'https://pagamento.sisnato.com.br/pagamentos';
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.txid) queryParams.append('txid', params.txid);
        if (params.forma_pagamento)
          queryParams.append('forma_pagamento', params.forma_pagamento);
        if (params.banco) queryParams.append('banco', params.banco);
        if (params.nomePagador)
          queryParams.append('nomePagador', params.nomePagador);
        if (params.documentoPagador)
          queryParams.append('documentoPagador', params.documentoPagador);
        if (params.dt_pg_from)
          queryParams.append('dt_pg_from', params.dt_pg_from);
        if (params.dt_pg_to) queryParams.append('dt_pg_to', params.dt_pg_to);
        if (params.valor_min !== undefined)
          queryParams.append('valor_min', params.valor_min.toString());
        if (params.valor_max !== undefined)
          queryParams.append('valor_max', params.valor_max.toString());
        if (params.page !== undefined)
          queryParams.append('page', params.page.toString());
        if (params.pageSize !== undefined)
          queryParams.append('pageSize', params.pageSize.toString());
        if (params.orderBy) queryParams.append('orderBy', params.orderBy);
        if (params.order) queryParams.append('order', params.order);
        url += `?${queryParams.toString()}`;
      }
      const request = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const response = await request.json();
      return response;
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      console.log('🚀 ~ PixService ~ findAll ~ error:', error);
      throw new HttpException(
        error.nome
          ? JSON.stringify(error, null, 2)
          : { message: error.mensagem },
        error.codigo ? error.codigo : 500,
      );
    }
  }
}
