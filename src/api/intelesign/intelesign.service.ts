import { HttpException, Injectable } from '@nestjs/common';
import { CreateIntelesignDto } from './dto/create-intelesign.dto';
import { UpdateIntelesignDto } from './dto/update-intelesign.dto';
import { PDFDocument, rgb } from 'pdf-lib';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { BucketDto } from 'src/s3/dto/bucket.dto';
import { SignatarioDto } from './dto/sign.dto';
import fontkit from '@pdf-lib/fontkit';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class IntelesignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}
  async create(
    createIntelesignDto: CreateIntelesignDto,
    file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new HttpException('Arquivo não enviado', 400);
      }
      const NomeOriginal = file.originalname;
      const Tamanho = file.size;
      const Tipo = file.mimetype;
      const Ext = NomeOriginal.split('.').pop();
      const NomeArquivo = `${Date.now()}.${Ext}`;
      const fileBuffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from(file.buffer);

      if (file.mimetype !== 'application/pdf') {
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const newFileBuffer = await pdfDoc.save();
        const newFile: Express.Multer.File = {
          ...file,
          buffer: Buffer.isBuffer(newFileBuffer)
            ? newFileBuffer
            : Buffer.from(newFileBuffer),
          mimetype: 'application/pdf',
        };
        file = newFile;
      }
      const token = await this.refreshToken();
      const save = await this.S3Upload(
        fileBuffer,
        NomeArquivo,
        Tipo,
        'intelesign-original',
      );

      const registro = await this.createRegistro({
        original_name: NomeOriginal,
        doc_original_down: save.url_download,
        doc_original_viw: save.url_view,
        signatarios: createIntelesignDto.signatarios,
        cca_id: createIntelesignDto.cca_id,
      });

      const signatarios = this.listSignatarios(
        registro.signatarios,
        createIntelesignDto.signatarios,
      );

      const Empreendimento = registro.signatarios
        .map((item) => item.empreendimento.nome)
        .join(', ');

      const envelope = await this.CreateEnvelope(
        Empreendimento,
        createIntelesignDto.valor,
        token,
      );

      const dadosManifesto = {
        codigoValidacao: envelope.id,
        signatarios,
        urlVerificacao: `https://app.intellisign.com/business/documents/info/`,
      };

      const CreateManifesto = await this.CreateManifesto(
        file.buffer,
        dadosManifesto,
      );

      const upload = await this.uploadManifesto(
        envelope.id,
        CreateManifesto,
        NomeArquivo,
        token,
      );
      await this.uploadRegistro(registro.id, {
        UUID: envelope.id,
        hash: upload.sha1,
        doc_modificado_down: upload.links.download,
        doc_modificado_viw: upload.links.display,
      });

      for (let i = 0; i < signatarios.length; i++) {
        await this.addSignatarios(signatarios[i], i, envelope.id, token);
      }

      await this.sendEnvelop(envelope.id, token);

      const retorno = {
        error: false,
        message: 'Envelope criado com sucesso',
        data: {
          download: upload.links.download,
          preview: upload.links.display,
        },
        total: 2,
        page: 1,
      };

      return retorno;

    } catch (error) {
      const message = error.message;
      const code = error.code;
      throw new HttpException(message, code);
    }
  }

  findAll() {
    return `This action returns all intelesign`;
  }

  findOne(id: number) {
    return `This action returns a #${id} intelesign`;
  }

  update(id: number, updateIntelesignDto: UpdateIntelesignDto) {
    return `This action updates a #${id} intelesign`;
  }

  remove(id: number) {
    return `This action removes a #${id} intelesign`;
  }

  //===================================== libs =====================================

  async refreshToken() {
    try {
      const data = await this.GetTokenData();
      if (data && this.isTimestampExpired(Number(data.expires_in))) {
        return data.access_token;
      }
      const Client_Id = process.env.INTELLISING_CLIENTE_ID;
      const Client_Secret = process.env.INTELLISING_CLIENTE_SECRET;
      const response = await fetch('https://api.intellisign.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: Client_Id,
          client_secret: Client_Secret,
          scope: '*',
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        const message = responseData.message;
        const code = responseData.code;
        throw new HttpException(message, code);
      }
      await this.prisma.read.appToken.update({
        where: {
          id: 1,
        },
        data: {
          access_token: responseData.access_token,
          expires_in: responseData.expires_in,
        },
      });
      return responseData.access_token;
    } catch (error) {
      const message = error.message;
      const code = error.code;
      throw new HttpException(message, code);
    }
  }

  async GetTokenData() {
    const response = await this.prisma.read.appToken.findUnique({
      where: {
        id: 1,
      },
    });
    return response;
  }

  isTimestampExpired(timestamp: number) {
    const now = Math.floor(Date.now() / 1000);
    return now > timestamp;
  }

  async S3Upload(
    file: Buffer,
    NomeArquivo: string,
    minetype: string,
    setor: BucketDto,
  ) {
    try {
      await this.s3.uploadFile(setor, NomeArquivo, minetype, file);
      return {
        url_view: `${process.env.LOCAL_URL}/file/${setor}/${NomeArquivo}`,
        url_download: `${process.env.LOCAL_URL}/file/download/${setor}/${NomeArquivo}`,
      };
    } catch (error) {
      const message = error.message;
      const code = error.code;
      throw new HttpException(message, code);
    }
  }

  async createRegistro(data: {
    original_name: string;
    doc_original_down: string;
    doc_original_viw: string;
    signatarios: SignatarioDto[];
    cca_id: number;
  }) {
    const registro = await this.prisma.write.intelesign.create({
      data: {
        original_name: data.original_name,
        doc_original_down: data.doc_original_down,
        doc_original_viw: data.doc_original_viw,
        signatarios: {
          connect: data.signatarios?.map((sig: any) => ({
            id: sig.id,
          })),
        },
        cca_id: data.cca_id,
      },
      include: {
        signatarios: {
          include: {
            empreendimento: true,
          },
        },
      },
    });
    return registro;
  }

  async uploadRegistro(
    id: number,
    data: {
      UUID: string;
      hash: string;
      doc_modificado_down: string;
      doc_modificado_viw: string;
    },
  ) {
    const upload = await this.prisma.write.intelesign.update({
      where: {
        id: id,
      },
      data: {
        UUID: data.UUID,
        hash: data.hash,
        doc_modificado_down: data.doc_modificado_down,
        doc_modificado_viw: data.doc_modificado_viw,
      },
    });
    return upload;
  }

  listSignatarios(
    registro: any,
    signatarios: SignatarioDto[],
  ): {
    nome: string;
    email: string;
    cpf: string;
    asstype: string;
    type: string;
  }[] {
    const lista = signatarios.map((item: SignatarioDto) => {
      const filtro = registro.find((item: any) => item.id === item.id);
      return {
        nome: filtro.nome,
        email: filtro.email,
        cpf: filtro.cpf.replace(/\D/g, '').trim(),
        asstype: item.asstype,
        type: item.type,
      };
    });
    return lista;
  }

  async CreateEnvelope(
    empreendimentoNome: string,
    expireIn: number,
    token: string,
  ) {
    try {
      const url = 'https://api.intellisign.com/v1/envelopes';

      // calcular data de expiração
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expireIn);

      const Body = {
        title: `SisNato - Assinatura de documento`,
        subject: `Contrato de financiamento de imóvel - '${empreendimentoNome}'`,
        message: `Por favor, assine o documento para prosseguir com o processo de financiamento de imóvel.`,
        expire_at: expireDate.toISOString(),
        action_reminder_frequency: 24,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar envelope:', error);
      throw new Error(`Erro ao criar envelope: ${error.message}`);
    }
  }

  private LAYOUT = {
    // Margens
    MARGIN: 50,
    MARGIN_TOP: 60,

    // Cores
    COLORS: {
      BLACK: rgb(0, 0, 0),
      WHITE: rgb(1, 1, 1),
      GRAY: rgb(0.3, 0.3, 0.3),
      LIGHT_GRAY: rgb(0.4, 0.4, 0.4),
      BLUE: rgb(0, 0, 1),
      GREEN: rgb(0, 0.7, 0),
      DARK_GREEN: rgb(0, 0.5, 0),
      YELLOW: rgb(1, 1, 0.4),
    },

    // Tamanhos de fonte
    FONT_SIZES: {
      TITLE: 20,
      SUBTITLE: 10,
      NORMAL: 12,
      SMALL: 10,
    },

    // Tamanhos de elementos
    ELEMENTS: {
      QR_CODE_SIZE: 90,
      CHECKBOX_SIZE: 16,
      LINE_HEIGHT: 18,
      SPACING: 20,
      SMALL_SPACING: 10,
    },
  };

  async CreateManifesto(
    file: Buffer,
    dadosManifesto: {
      codigoValidacao: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
        asstype: string;
        type: string;
      }[];
      urlVerificacao: string;
      logoPath?: string;
    },
  ) {
    try {
      // 1. Configuração inicial do documento
      const pdfDoc = await PDFDocument.load(file);
      pdfDoc.registerFontkit(fontkit);

      // 2. Configuração da página
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      // 3. Carregamento de fontes
      const { robotoRegular, robotoBold } = await this.loadFonts(pdfDoc);

      // 4. Função auxiliar para desenhar texto
      const drawText = this.createTextDrawer(page, robotoRegular, robotoBold);

      // 5. Posicionamento inicial
      let yPosition = height - this.LAYOUT.MARGIN_TOP;

      // 6. Geração do QR Code
      const qrCodeImage = await this.generateQRCode(pdfDoc, dadosManifesto);

      // 7. Desenha o cabeçalho com logo e QR Code
      yPosition = await this.drawHeader(
        page,
        drawText,
        qrCodeImage,
        dadosManifesto,
        yPosition,
        width,
        robotoRegular,
        robotoBold,
        pdfDoc,
      );

      // 8. Desenha o código de validação
      yPosition = this.drawValidationCode(
        page,
        drawText,
        dadosManifesto.codigoValidacao,
        yPosition,
        width,
        robotoRegular,
        robotoBold,
      );

      // 9. Desenha a lista de signatários
      yPosition = this.drawSignatories(
        page,
        drawText,
        dadosManifesto.signatarios || [],
        yPosition,
      );

      // 10. Desenha as instruções de verificação
      this.drawVerificationInstructions(
        page,
        drawText,
        dadosManifesto,
        yPosition,
        robotoRegular,
      );

      // 11. Salva e retorna o PDF
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erro ao criar envelope:', error);
      throw new Error(`Erro ao criar envelope: ${error.message}`);
    }
  }

  async loadFonts(pdfDoc: PDFDocument) {
    try {
      const fontsPath = path.join(process.cwd(), 'src/pdf_create/assets/fonts');

      const [robotoRegular, robotoBold] = await Promise.all([
        pdfDoc.embedFont(
          await fs.promises.readFile(
            path.join(fontsPath, 'Roboto-Regular.ttf'),
          ),
        ),
        pdfDoc.embedFont(
          await fs.promises.readFile(path.join(fontsPath, 'Roboto-Bold.ttf')),
        ),
      ]);

      return { robotoRegular, robotoBold };
    } catch (error) {
      console.error('Erro ao carregar fontes Roboto:', error);
      throw new Error('Não foi possível carregar as fontes Roboto necessárias');
    }
  }

  createTextDrawer(page: any, regularFont: any, boldFont: any) {
    return (
      text: string,
      x: number,
      y: number,
      size: number,
      options: { bold?: boolean; color?: any; maxWidth?: number } = {},
    ) => {
      if (!text) return;

      const {
        bold = false,
        color = this.LAYOUT.COLORS.BLACK,
        maxWidth,
      } = options;
      const font = bold ? boldFont : regularFont;

      try {
        if (maxWidth) {
          // Implementar quebra de linha se necessário
          page.drawText(text, { x, y, size, font, color, maxWidth });
        } else {
          page.drawText(text, { x, y, size, font, color });
        }
      } catch (error) {
        console.error('Erro ao desenhar texto:', { text, error });
      }
    };
  }

  async generateQRCode(
    pdfDoc: PDFDocument,
    data: {
      codigoValidacao: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
        asstype: string;
        type: string;
      }[];
      urlVerificacao: string;
      logoPath?: string;
    },
  ) {
    try {
      const urlVerificacao = data.urlVerificacao || '';
      const codigoValidacao = data.codigoValidacao || 'N/A';

      const qrCodeDataUrl = await QRCode.toDataURL(
        `${urlVerificacao}${codigoValidacao}`,
        { width: 300, margin: 1 }, // Maior resolução para melhor qualidade
      );

      const qrCodeBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      return await pdfDoc.embedPng(qrCodeBytes);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw new Error('Falha ao gerar o QR Code');
    }
  }

  async drawHeader(
    page: any,
    drawText: Function,
    qrCodeImage: any,
    data: {
      codigoValidacao: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
        asstype: string;
        type: string;
      }[];
      urlVerificacao: string;
      logoPath?: string;
    },
    yPosition: number,
    pageWidth: number,
    robotoRegular: any,
    robotoBold: any,
    pdfDoc: any,
  ) {
    const { MARGIN, ELEMENTS, COLORS, FONT_SIZES } = this.LAYOUT;
    const headerTop = yPosition;
    const qrCodeSize = ELEMENTS.QR_CODE_SIZE;

    try {
      // 1. Desenha o logo à esquerda
      const logoPath =
        data.logoPath ||
        path.resolve(
          process.cwd(),
          'src/api/intelesign/lib/public/Logo_Sisnato_013.png',
        );

      if (fs.existsSync(logoPath)) {
        const logoBytes = await fs.promises.readFile(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);

        // Ajusta o tamanho mantendo a proporção
        const logoAspectRatio = logoImage.width / logoImage.height;
        const logoHeight = qrCodeSize;
        const logoWidth = qrCodeSize * logoAspectRatio;

        page.drawImage(logoImage, {
          x: MARGIN,
          y: headerTop - logoHeight,
          width: logoWidth,
          height: logoHeight,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar o logo:', error);
      drawText('LOGO NÃO CARREGADO', MARGIN, headerTop - 20, 10, {
        color: COLORS.BLACK,
        bold: true,
      });
    }
    // 2. Desenha o QR Code à direita
    page.drawImage(qrCodeImage, {
      x: pageWidth - MARGIN - qrCodeSize,
      y: headerTop - qrCodeSize,
      width: qrCodeSize,
      height: qrCodeSize,
    });

    // 3. Título centralizado
    const title = 'Manifesto de\nAssinaturas Digitais';
    let currentY = headerTop - qrCodeSize - 30;

    // Usamos a fonte em negrito para calcular a largura
    const titleFont = robotoBold;

    title.split('\n').forEach((line) => {
      const textWidth = titleFont.widthOfTextAtSize(line, FONT_SIZES.TITLE);
      drawText(line, (pageWidth - textWidth) / 2, currentY, FONT_SIZES.TITLE, {
        bold: true,
      });
      currentY -= FONT_SIZES.TITLE + 5;
    });

    // 4. Subtítulo
    const subtitle = 'Documento assinado digitalmente com validade jurídica';
    const subtitleFont = robotoRegular;
    const subtitleWidth = subtitleFont.widthOfTextAtSize(
      subtitle,
      FONT_SIZES.SUBTITLE,
    );

    drawText(
      subtitle,
      (pageWidth - subtitleWidth) / 2,
      currentY - 15,
      FONT_SIZES.SUBTITLE,
      { color: COLORS.GRAY },
    );

    return currentY - 50; // Retorna a nova posição Y
  }

  drawValidationCode(
    page: any,
    drawText: Function,
    codigoValidacao: string,
    yPosition: number,
    pageWidth: number,
    robotoRegular: any,
    robotoBold: any,
  ) {
    const { MARGIN, COLORS, FONT_SIZES } = this.LAYOUT;

    // Texto do código
    const label = 'Código de validação: ';
    const labelWidth = robotoRegular.widthOfTextAtSize(
      label,
      FONT_SIZES.NORMAL,
    );
    const codeWidth = robotoBold.widthOfTextAtSize(
      codigoValidacao,
      FONT_SIZES.NORMAL,
    );

    const startX = (pageWidth - (labelWidth + codeWidth)) / 2;

    // Desenha o texto do label
    drawText(label, startX, yPosition, FONT_SIZES.NORMAL, {
      color: COLORS.LIGHT_GRAY,
    });

    // Desenha o fundo amarelo para o código
    const codeX = startX + labelWidth;
    const padding = 4;

    page.drawRectangle({
      x: codeX - padding / 2,
      y: yPosition - 4,
      width: codeWidth + padding,
      height: 18,
      color: COLORS.YELLOW,
      borderColor: COLORS.BLACK,
      borderWidth: 0.5,
    });

    // Desenha o código em negrito
    drawText(codigoValidacao, codeX, yPosition, FONT_SIZES.NORMAL, {
      bold: true,
    });

    // Linha separadora
    yPosition -= 40;
    page.drawLine({
      start: { x: MARGIN, y: yPosition },
      end: { x: pageWidth - MARGIN, y: yPosition },
      thickness: 0.5,
      color: COLORS.BLACK,
    });

    return yPosition - 30;
  }

  drawSignatories(
    page: any,
    drawText: Function,
    signatarios: {
      nome: string; // Nome do signatário
      email: string; // Email do signatário
      cpf: string; // CPF do signatário
      asstype: string; // Tipo de assinatura (simple ou qualified)
      type: string; // Tipo de destinatário (signer, approver, carbon-copy)
    }[],
    yPosition: number,
  ) {
    const { MARGIN, COLORS, FONT_SIZES, ELEMENTS } = this.LAYOUT;

    // Texto explicativo
    const textoExplicativo =
      'Documento assinado digitalmente com o uso de Certificado Digital ICP Brasil, o assinador IntelliSign, pelos seguintes signatários:';

    // Quebra o texto em várias linhas se necessário - simplificado
    const maxWidth = page.getSize().width - 2 * MARGIN;
    const lines = [];
    const words = textoExplicativo.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      // Estimativa simples: aproximadamente 6 pixels por caractere
      if (testLine.length * 6 <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }
    if (currentLine) lines.push(currentLine);

    // Desenha o texto explicativo
    lines.forEach((line) => {
      drawText(line, MARGIN, yPosition, FONT_SIZES.NORMAL);
      yPosition -= ELEMENTS.LINE_HEIGHT;
    });

    yPosition -= 10;

    // Desenha a lista de signatários
    signatarios.forEach((signatario) => {
      // Checkbox verde
      page.drawRectangle({
        x: MARGIN,
        y: yPosition - 2,
        width: ELEMENTS.CHECKBOX_SIZE,
        height: ELEMENTS.CHECKBOX_SIZE,
        color: COLORS.GREEN,
        borderColor: COLORS.DARK_GREEN,
        borderWidth: 0.5,
      });

      // Check branco
      drawText('✓', MARGIN + 4, yPosition + 2, 10, { color: COLORS.WHITE });

      // Nome e CPF do signatário
      const nome = signatario.nome || 'Nome não informado';
      const cpf = signatario.cpf
        ? this.formatCPF(signatario.cpf)
        : 'CPF não informado';
      const signatarioTexto = `${nome} - ${cpf}`;

      drawText(
        signatarioTexto,
        MARGIN + ELEMENTS.CHECKBOX_SIZE + 10,
        yPosition,
        FONT_SIZES.NORMAL,
      );

      yPosition -= 25;
    });

    // Linha separadora
    yPosition -= 20;
    page.drawLine({
      start: { x: MARGIN, y: yPosition },
      end: { x: page.getWidth() - MARGIN, y: yPosition },
      thickness: 0.5,
      color: COLORS.BLACK,
    });

    return yPosition - 30;
  }

  drawVerificationInstructions(
    page: any,
    drawText: Function,
    data: {
      codigoValidacao: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
        asstype: string;
        type: string;
      }[];
      urlVerificacao: string;
      logoPath?: string;
    },
    yPosition: number,
    font: any,
  ) {
    const { MARGIN, COLORS, FONT_SIZES } = this.LAYOUT;
    const pageWidth = page.getWidth();

    // Primeira linha das instruções
    const instrucao1 = 'Para verificar as assinaturas acesse: ';
    const urlVerificacao = data.urlVerificacao || '';

    // Desenha o texto da instrução
    drawText(instrucao1, MARGIN, yPosition, FONT_SIZES.NORMAL);

    // Desenha a URL em azul - com quebra de linha se necessário
    const textWidth = font.widthOfTextAtSize(instrucao1, FONT_SIZES.NORMAL);
    const maxWidth = page.getSize().width - MARGIN * 2 - textWidth;

    // Função para quebrar texto em várias linhas
    const breakText = (text: string, maxWidth: number): string[] => {
      const words = text.split('/');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine}/${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, FONT_SIZES.NORMAL);

        if (testWidth <= maxWidth || currentLine === '') {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }

        // Se for o último item, adiciona a linha atual
        if (i === words.length - 1 && currentLine) {
          lines.push(currentLine);
        }
      }

      return lines.length > 0 ? lines : [text];
    };

    // Quebra a URL em várias linhas se necessário
    const urlLines = breakText(urlVerificacao, maxWidth);

    // Desenha cada linha da URL
    urlLines.forEach((line, index) => {
      const lineY = yPosition - index * (FONT_SIZES.NORMAL + 5);
      const lineX = index === 0 ? MARGIN + textWidth : MARGIN + 20; // Indenta as linhas seguintes mais à esquerda

      // Desenha o texto do link em azul
      drawText(line, lineX, lineY, FONT_SIZES.NORMAL, {
        color: COLORS.BLUE,
        underline: true,
      });

      // Adiciona link clicável (será visível em visualizadores de PDF que suportam)
      try {
        const textWidth = font.widthOfTextAtSize(line, FONT_SIZES.NORMAL);
        page.drawRectangle({
          x: lineX,
          y: lineY - 1,
          width: textWidth,
          height: 14,
          borderWidth: 0,
          color: COLORS.WHITE,
          opacity: 0,
          link: page.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [lineX, lineY - 12, lineX + textWidth, lineY + 2],
            Border: [0, 0, 0],
            A: {
              Type: 'Action',
              S: 'URI',
              URI: line.startsWith('http') ? line : `http://${line}`,
            },
          }),
        });
      } catch (error) {
        console.warn('Erro ao adicionar link clicável:', error);
      }
    });
    // Ajusta a posição Y baseado no número de linhas da URL
    yPosition -= urlLines.length * (FONT_SIZES.NORMAL + 5) + 15;

    // Segunda linha das instruções
    const instrucao2 = 'Ou escaneie o QR Code acima com seu dispositivo móvel.';
    drawText(instrucao2, MARGIN, yPosition, FONT_SIZES.NORMAL);

    yPosition -= 25;

    // Link direto - também com quebra de linha se necessário
    const linkDireto = `${urlVerificacao}${data.codigoValidacao || ''}`;
    const linkLabel = 'Link direto: ';
    drawText(linkLabel, MARGIN, yPosition, FONT_SIZES.NORMAL);

    const labelWidth = font.widthOfTextAtSize(linkLabel, FONT_SIZES.NORMAL);
    const maxLinkWidth = page.getSize().width - MARGIN * 2 - labelWidth;

    // Quebra o link direto em várias linhas se necessário
    const linkLines = breakText(linkDireto, maxLinkWidth);

    // Desenha cada linha do link direto
    linkLines.forEach((line, index) => {
      const lineY = yPosition - index * (FONT_SIZES.NORMAL + 5);
      const lineX = index === 0 ? MARGIN + labelWidth : MARGIN + 20; // Indenta as linhas seguintes mais à esquerda

      // Desenha o texto do link em azul
      drawText(line, lineX, lineY, FONT_SIZES.NORMAL, {
        color: COLORS.BLUE,
        underline: true,
      });

      // Adiciona link clicável (será visível em visualizadores de PDF que suportam)
      try {
        const textWidth = font.widthOfTextAtSize(line, FONT_SIZES.NORMAL);
        page.drawRectangle({
          x: lineX,
          y: lineY - 1,
          width: textWidth,
          height: 14,
          borderWidth: 0,
          color: COLORS.WHITE,
          opacity: 0,
          link: page.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [lineX, lineY - 12, lineX + textWidth, lineY + 2],
            Border: [0, 0, 0],
            A: {
              Type: 'Action',
              S: 'URI',
              URI: line.startsWith('http') ? line : `http://${line}`,
            },
          }),
        });
      } catch (error) {
        console.warn('Erro ao adicionar link clicável:', error);
      }
    });

    // Ajusta a posição Y baseado no número de linhas do link direto
    yPosition -= linkLines.length * (FONT_SIZES.NORMAL + 5) + 15;
  }

  formatCPF(cpf: string): string {
    if (!cpf) return '';

    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '');

    // Formata como 000.000.000-00
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  async uploadManifesto(
    envelopeId: string,
    file: Buffer<ArrayBuffer>,
    nomeArquivo: string,
    token: string,
  ) {
    try {
      const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}/documents`;

      const blob = new Blob([file], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', blob, nomeArquivo);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resposta de erro da API:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `API retornou erro ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Erro ao upload manifesto:', error);
      throw new Error(`Erro ao upload manifesto: ${error.message}`);
    }
  }

  async addSignatarios(
    signatario: {
      type: string;
      asstype: string;
      email: string;
      nome: string;
      cpf: string;
    },
    index: number,
    envelopeId: string,
    token: string,
  ) {
    try {
      if (!signatario) {
        throw new Error('Nenhum signatário fornecido');
      }
      const TesteEmail = [
        'kingdevtec@gmail.com',
        'killerxandy@gmail.com',
        'kingdever88@gmail.com',
      ];

     const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}/recipients`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: signatario.type,
          signature_type: signatario.asstype,
          routing_order: index + 1,
          addressees: [
            {
              via: 'email',
              // value: signatario.email,
              value: TesteEmail[index],
              name: signatario.nome,
              identifiers: [
                {
                  code: 'CPF',
                  is_required: true,
                  // value: signatario.cpf, // Remove caracteres não numéricos
                  value: '34057309888', // Remove caracteres não numéricos
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      if(!response.ok){
        throw new Error(`Erro ao adicionar signatários: ${data.message}`);
      }
      return data;
    } catch (error) {
      console.error('Erro ao adicionar signatários:', error);
      throw new Error(`Erro ao adicionar signatários: ${error.message}`);
    }
  }

  async sendEnvelop(envelopeId: string, token: string) {
    try {
      const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}/send`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Erro ao enviar envelope: ${data.message}`);
      }
      return data;
    } catch (error) {
      console.error('Erro ao enviar envelope:', error);
      throw new Error(`Erro ao enviar envelope: ${error.message}`);
    }
  }
}
