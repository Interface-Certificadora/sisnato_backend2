import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendContactMail(
    nome: string,
    email: string,
    empresa: string,
    mensagem: string,
  ) {
    try {
      await this.prisma.contactMessages.create({
        data: {
          nome,
          email,
          empresa,
          mensagem,
        },
      });
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: process.env.EMAIL_RECIPIENT,
        subject: `Nova mensagem de contato de ${nome}`,
        html: `
          <h2>Nova Mensagem do Site SisNATO</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Empresa:</strong> ${empresa || 'Não informado'}</p>
          <hr>
          <h3>Mensagem:</h3>
          <p>${mensagem.replace(/\n/g, '<br>')}</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);

      return { message: 'Mensagem recebida e e-mail enviado com sucesso!' };
    } catch (error) {
      console.error('Falha no processo de contato:', error);
      throw new InternalServerErrorException(
        'Ocorreu uma falha ao processar sua mensagem.',
      );
    }
  }
}
