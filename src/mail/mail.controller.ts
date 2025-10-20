import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { ContactDto } from './dto/contact.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envia um e--mail a partir do formulário de contato',
  })
  @ApiResponse({ status: 200, description: 'E-mail enviado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos no corpo da requisição.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno no servidor ao tentar enviar o e-mail.',
  })
  async sendContactEmail(@Body() contactDto: ContactDto) {
    const { nome, email, empresa, mensagem } = contactDto;
    return this.mailService.sendContactMail(nome, email, empresa, mensagem);
  }
}
