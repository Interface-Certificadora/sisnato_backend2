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

  async sendRecoverPasswordMail(
    userEmail: string,
    userName: string,
    token: string,
  ) {
    // URL do front-end onde o usuário digita a nova senha
    // Exemplo de url final: https://meusite.com/reset-password?token=12345
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: userEmail,
      subject: 'Recuperação de Senha - SisNATO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00713D;">Recuperação de Senha</h2>
          <p>Olá, <strong>${userName}</strong>,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
          <br/>
          <p>Para redefinir sua senha, clique no botão abaixo (válido por 1 hora):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #00713D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Redefinir Minha Senha
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
          <p style="font-size: 12px; color: #00713D;">${resetUrl}</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw new InternalServerErrorException(
        'Erro ao enviar email de recuperação.',
      );
    }
  }
}
