import { HttpException, Injectable } from '@nestjs/common';
import { CreatePixDto } from './dto/create-pix.dto';
import { FindAllPixQueryDto } from './dto/find-all-pix-query.dto';
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

  async create(createPixDto: CreatePixDto, expiracao = 3600) {
    const certUser = this.configService.get<string>('EFI_PIX_CERT_PATH');
    const rota = path.join(process.cwd(), certUser || '');
    this.options.certificate = rota;

    const { cpf, nome, valor } = createPixDto;

    try {
      const valorFormatado = parseFloat(String(valor).replace(',', '.')).toFixed(2);
      const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : undefined;

      const body = {
        calendario: { expiracao },
        devedor: { cpf: cpfLimpo, nome: nome ? nome.trim() : 'Cliente' },
        valor: { original: valorFormatado },
        chave: this.configService.get<string>('CHAVE_PIX')?.trim(),
      };

      const efipay = new EfiPay(this.options);
      const pixCharge: any = await efipay.pixCreateImmediateCharge(null, body);

      console.log('🔄 Gerando QR Code usando loc.id:', pixCharge.loc?.id);
      const qrCodeData: any = await this.QrCodeEfi(pixCharge.loc.id);

      const responsePayload = {
        txid: pixCharge.txid,
        pixCopiaECola: pixCharge.pixCopiaECola || qrCodeData.qrcode,
        imagemQrcode: qrCodeData.imagemQrcode || qrCodeData.qrcode,
      };

      return responsePayload;
    } catch (error: any) {
      console.error('❌ [BACKEND - PIX CREATE ERROR]:', error);
      this.LogError.Post(JSON.stringify(error, null, 2));

      throw new HttpException(
        {
          message:
            error.response?.data?.mensagem ||
            error.message ||
            'Erro ao gerar PIX',
        },
        500,
      );
    }
  }

  async QrCodeEfi(id: string) {
    console.log('🔍 [BACKEND - QrCodeEfi] Gerando QR Code para Location ID:', id);
    const certUser = this.configService.get<string>('EFI_PIX_CERT_PATH');
    const rota = path.join(process.cwd(), certUser || '');
    this.options.certificate = rota;

    try {
      const params: any = { id };
      const efipay = new EfiPay(this.options);
      const result = await efipay.pixGenerateQRCode(params);
      return result;
    } catch (error: any) {
      console.error('❌ [BACKEND - QrCodeEfi ERROR]:', error);
      this.LogError.Post(JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 500);
    }
  }

  async PixPaymentStatus(Txid: string) {
    console.log(`🔍 [BACKEND - PixPaymentStatus] Consultando TXID: ${Txid}`);
    const certUser = this.configService.get<string>('EFI_PIX_CERT_PATH');
    const rota = path.join(process.cwd(), certUser || '');
    this.options.certificate = rota;

    try {
      const params = { txid: Txid };
      const efipay = new EfiPay(this.options);
      const result = await efipay.pixDetailCharge(params);

      console.log(`✅ [BACKEND - PixPaymentStatus] Retorno Efí para TXID ${Txid}:`, {
        status: result.status,
        txid: result.txid,
      });

      const solicitacao = await this.prismaService.solicitacao.findFirst({
        where: { txid: Txid },
        select: { id: true },
      });

      if (result.status === 'CONCLUIDA') {
        if (result.pix && result.pix.length > 0) {
          const horario = result.pix[0].horario;
          const HorarioCorrigido = new Date(horario);
          HorarioCorrigido.setHours(HorarioCorrigido.getHours() - 3);

          if (solicitacao) {
            console.log(`💾 [BACKEND] Atualizando Solicitação ID ${solicitacao.id} para PAGO`);
            await this.prismaService.solicitacao.update({
              where: { id: solicitacao.id },
              data: {
                pg_date: HorarioCorrigido,
                pg_andamento: 'PAGO',
                pg_status: true,
                situacao_pg: 3,
                estatos_pgto: 'pago',
              },
            });
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error(`❌ [BACKEND - PixPaymentStatus ERROR] TXID ${Txid}:`, error);
      this.LogError.Post(JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 500);
    }
  }

  async webhookCreate(url: string) {
    try {
      const localOptions = { ...this.options, validateMtls: true };
      const body = { webhookUrl: url };
      const params = { chave: this.configService.get<string>('CHAVE_PIX') };

      const efipay = new EfiPay(localOptions);
      const result = await efipay.pixConfigWebhook(params, body);
      return { message: 'Webhook configurado com sucesso', data: { ...result } };
    } catch (error: any) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      const errormessage = error.nome ? error : { message: error.mensagem };
      throw new HttpException(errormessage, error.codigo ? error.codigo : 500);
    }
  }

  async findAll(params: FindAllPixQueryDto) {
    try {
      let url = 'https://pagamento.sisnato.com.br/pagamentos';
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.txid) queryParams.append('txid', params.txid);
        if (params.forma_pagamento) queryParams.append('forma_pagamento', params.forma_pagamento);
        if (params.banco) queryParams.append('banco', params.banco);
        if (params.nomePagador) queryParams.append('nomePagador', params.nomePagador);
        if (params.documentoPagador) queryParams.append('documentoPagador', params.documentoPagador);
        if (params.dt_pg_from) queryParams.append('dt_pg_from', params.dt_pg_from);
        if (params.dt_pg_to) queryParams.append('dt_pg_to', params.dt_pg_to);
        if (params.valor_min !== undefined) queryParams.append('valor_min', params.valor_min.toString());
        if (params.valor_max !== undefined) queryParams.append('valor_max', params.valor_max.toString());
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
        if (params.orderBy) queryParams.append('orderBy', params.orderBy);
        if (params.order) queryParams.append('order', params.order);
        url += `?${queryParams.toString()}`;
      }
      const request = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await request.json();
    } catch (error: any) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      throw new HttpException(
        error.nome ? JSON.stringify(error, null, 2) : { message: error.mensagem },
        error.codigo ? error.codigo : 500,
      );
    }
  }
}