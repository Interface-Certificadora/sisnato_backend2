import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { UserPayload } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { BucketDto } from 'src/s3/dto/bucket.dto';
import { S3Service } from 'src/s3/s3.service';
import { CreateIntelesignDto } from './dto/create-intelesign.dto';
import { QueryDto } from './dto/query.dto';
import { SignatarioDto } from './dto/sign.dto';

@Injectable()
export class IntelesignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  private createResponse(
    message: string,
    status: number,
    data: any | null,
    total?: number,
    page?: number,
  ) {
    return {
      error: false,
      message,
      status,
      data,
      total: total || 0,
      page: page || 0,
    };
  }

  async create(
    createIntelesignDto: CreateIntelesignDto,
    file: Express.Multer.File,
    User: UserPayload,
  ) {
    try {
      if (!file) {
        throw new HttpException('Arquivo não enviado', 400);
      }
      const NomeOriginal = file.originalname;
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
        message: createIntelesignDto.message,
        title: createIntelesignDto.title,
        description: createIntelesignDto.subject,
        valor: createIntelesignDto.valor,
        construtora_id: createIntelesignDto.const_id,
        user_id: User.id,
        type: createIntelesignDto.type,
      });

      const signatarios = createIntelesignDto.signatarios;

      const envelope = await this.CreateEnvelope(
        createIntelesignDto.title,
        createIntelesignDto.subject,
        createIntelesignDto.message,
        createIntelesignDto.expire_at,
        token,
      );
      if (!envelope.id) {
        throw new HttpException('Erro ao criar envelope', 500);
      }

      const dadosManifesto = {
        codigoValidacao: envelope.id,
        asstype: createIntelesignDto.type,
        signatarios,
        urlVerificacao: `https://app.intellisign.com/business/documents/info`,
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

      await Promise.all(
        signatarios.map(
          async (signatario, index) =>
            await this.addSignatarios(
              signatario,
              createIntelesignDto.type,
              index,
              envelope.id,
              token,
            ),
        ),
      );

      await this.sendEnvelop(envelope.id, token);

      const retorno = {
        download: upload.links.download,
        preview: upload.links.display,
      };

      return this.createResponse('Envelope criado com sucesso', 200, retorno);
    } catch (error) {
      const message = error.message;
      const code = error.code || 500;
      throw new HttpException(message, code);
    }
  }

  async findAll(query: QueryDto, User: UserPayload) {
    try {
      const {
        page = 1,
        limit = 20,
        cca_id,
        id,
        nome,
        status,
        data_inicio,
        data_fim,
      } = query;

      const skip = (page - 1) * limit;
      const take = limit;
      const where: any = {};

      if (cca_id) {
        if (User.hierarquia !== 'ADM') {
          if (!User.Financeira.find((item) => item === Number(cca_id))) {
            throw new HttpException('Acesso negado', 403);
          }
          const IsFinanceira = await this.GetFinanceira(Number(cca_id));
          if (!IsFinanceira) {
            throw new HttpException(
              'CCA não tem Permissão para Utilizar esse serviço',
              403,
            );
          }
          where.cca_id = Number(cca_id);
        }
        where.cca_id = Number(cca_id); // converte para número se necessário
      }
      if (!cca_id) {
        if (User.hierarquia !== 'ADM') {
          const isFinanceira = [];
          User.Financeira.forEach(async (item) => {
            const IsFinanceira = await this.GetFinanceira(Number(item));
            if (IsFinanceira) {
              isFinanceira.push(Number(item));
            }
          });
          if (isFinanceira.length === 0) {
            throw new HttpException('Acesso negado', 403);
          }
          where.cca_id = {
            in: isFinanceira,
          };
        }
      }
      if (id) {
        where.id = Number(id); // converte para número se necessário
      }
      if (nome) {
        where.nome = { contains: nome }; // busca parcial
      }
      if (status) {
        where.status = status;
      }
      if (data_inicio) {
        where.data_inicio = { gte: new Date(data_inicio) }; // maior ou igual
      }
      if (data_fim) {
        where.data_fim = { lte: new Date(data_fim) }; // menor ou igual
      }
      where.ativo = true;

      // Prisma não tem findManyAndCount, precisa fazer separadamente
      const [data, count] = await Promise.all([
        this.prisma.intelesign.findMany({
          where,
          skip,
          take,
          include: {
            cca: true,
            signatarios: true,
            contrutora: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.intelesign.count({ where }),
      ]);

      data.forEach(async (item) => {
        await this.findOneStatus(item.id);
      });

      // Prisma não tem findManyAndCount, precisa fazer separadamente
      const [dados] = await Promise.all([
        this.prisma.intelesign.findMany({
          where,
          skip,
          take,
          include: {
            cca: true,
            signatarios: true,
            contrutora: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return this.createResponse(
        'Dados buscados com sucesso',
        200,
        dados,
        count,
        page,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar dados',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number, User: UserPayload) {
    try {
      const where: any = {};
      if (User.hierarquia !== 'ADM') {
        const isFinanceira = [];
        User.Financeira.forEach(async (item) => {
          const IsFinanceira = await this.GetFinanceira(Number(item));
          if (IsFinanceira) {
            isFinanceira.push(Number(item));
          }
        });
        if (isFinanceira.length === 0) {
          throw new HttpException('Acesso negado', 403);
        }
        where.cca_id = {
          in: isFinanceira,
        };
      }
      where.id = Number(id);
      where.ativo = true;
      return this.prisma.intelesign.findUnique({
        where,
        include: {
          cca: true,
          signatarios: true,
          contrutora: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar dados',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneStatus(id: number) {
    try {
      // Busca o envelope
      const envelope = await this.prisma.executeWithRetry(() =>
        this.prisma.intelesign.findUnique({
          where: { id },
          include: {
            signatarios: true,
          },
        }),
      );

      if (!envelope) {
        throw new HttpException('Envelope não encontrado', 404);
      }

      // Obtém o token e busca o status na API externa
      const token = await this.refreshToken();

      const status = await this.GetStatus(envelope.UUID, token);

      // Prepara as atualizações em lote
      const updatePromises = [];

      // Atualiza status dos signatários
      for (const recipient of status.recipients || []) {
        const recipientData = this.extractRecipientData(recipient);

        // Busca o signatário pelo UUID primeiro (mais eficiente)
        let signatario = await this.prisma.executeWithRetry(() =>
          this.prisma.intelesignSignatario.findFirst({
            where: { UUID: recipientData.uuid, envelope_id: envelope.id },
          }),
        );
        // Se não encontrou pelo UUID, tenta buscar por CPF e email
        if (!signatario) {
          const testsignatario = await this.prisma.executeWithRetry(() =>
            this.prisma.intelesignSignatario.findFirst({
              where: {
                cpf: recipientData.cpf,
                email: recipientData.email,
                envelope_id: envelope.id,
              },
            }),
          );

          if (testsignatario) {
            await this.prisma.executeWithRetry(() =>
              this.prisma.intelesignSignatario.update({
                where: { id: testsignatario.id },
                data: {
                  state: recipientData.state,
                  filled_at: recipientData.assinado,
                  ...(recipientData.uuid && { UUID: recipientData.uuid }),
                },
              }),
            );

            signatario = testsignatario;
          }
        }

        // Se encontrou o signatário, prepara a atualização
        if (signatario) {
          await this.prisma.executeWithRetry(() =>
            this.prisma.intelesignSignatario.update({
              where: { id: signatario.id },
              data: {
                state: recipientData.state,
                filled_at: recipientData.assinado,
                ...(recipientData.uuid && { UUID: recipientData.uuid }),
              },
            }),
          );
        }
      }


      let StatusName: string;
      switch (status.state) {
        case 'done':
          StatusName = 'Concluído';
          break;
        case 'completed':
          StatusName = 'Concluído';
          break;
        case 'pending':
          StatusName = 'Pendente';
          break;
        case 'draft':
          StatusName = 'Rascunho';
          break;
        case 'new':
          StatusName = 'Novo';
          break;
        case 'draft':
          StatusName = 'Rascunho';
          break;
        case 'signing':
          StatusName = 'Assinando';
          break;
        case 'rejected':
          StatusName = 'Rejeitado';
          break;
        case 'failed':
          StatusName = 'Falhou';
          break;
        case 'expired':
          StatusName = 'Expirado';
          break;
          default:
            StatusName = 'Em andamento';
            break;
          };
          // Adiciona a atualização do status do envelope
          updatePromises.push(
        this.prisma.executeWithRetry(() =>
          this.prisma.intelesign.update({
            where: { id },
            data: {
              status: status.state,
              status_view: StatusName,
              doc_modificado_down: status.links?.download || null,
              doc_modificado_viw: status.links?.display || null,
            },
          }),
        ),
      );

      // Executa todas as atualizações em paralelo
      await Promise.all(updatePromises);

      return this.createResponse(
        'Envelope encontrado com sucesso',
        200,
        status,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar dados',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Extrai dados do destinatário da resposta da API
   */
  private extractRecipientData(recipient: any) {
    const data = {
      uuid: recipient.id || null,
      state: recipient.state || null,
      email: null as string | null,
      assinado: null as string | null,
      cpf: null as string | null,
    };

    for (const addressee of recipient.addressees || []) {
      if (addressee.via === 'email') {
        data.email = addressee.value;
        data.assinado = addressee.ran_action_at;
      }

      for (const identifier of addressee.identifiers || []) {
        if (identifier.code === 'CPF') {
          data.cpf = identifier.value.replace(/\D/g, '');
        }
      }
    }

    return data;
  }

  remove(id: number, User: UserPayload) {
    try {
      const where: any = {};
      if (User.hierarquia !== 'ADM') {
        const isFinanceira = [];
        User.Financeira.forEach(async (item) => {
          const IsFinanceira = await this.GetFinanceira(Number(item));
          if (IsFinanceira) {
            isFinanceira.push(Number(item));
          }
        });
        if (isFinanceira.length === 0) {
          throw new HttpException('Acesso negado', 403);
        }
        where.cca_id = {
          in: isFinanceira,
        };
      }
      where.id = Number(id); // converte para número se necessário
      return this.prisma.intelesign.update({
        where,
        data: { ativo: false },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar dados',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //===================================== libs =====================================

  async refreshToken() {
    try {
      const data = await this.GetTokenData();
      // console.log(
      //   '🚀 ~ IntelesignService ~ refreshToken ~ ativo:',
      //   this.isTimestampExpired(Number(data.expires_in)),
      // );
      if (!this.isTimestampExpired(Number(data.expires_in))) {
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
      if (!response.ok) {
        const message = responseData.message;
        const code = responseData.code;
        throw new HttpException(message, code);
      }
      await this.prisma.appToken.update({
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
    const response = await this.prisma.appToken.findUnique({
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
    cca_id?: number; // Adicione o '?' para indicar que é opcional
    message: string;
    title: string;
    description: string;
    valor: number;
    construtora_id: number;
    user_id: number;
    type: string;
  }) {
    const registro = await this.prisma.intelesign.create({
      data: {
        original_name: data.original_name,
        doc_original_down: data.doc_original_down,
        doc_original_viw: data.doc_original_viw,
        message: data.message,
        title: data.title,
        description: data.description,
        valor: data.valor,
        construtora_id: data.construtora_id,
        ...(data.cca_id && { cca_id: data.cca_id }),
        user_id: data.user_id,
        type: data.type,
      },
    });

    data.signatarios.forEach(async (sig: SignatarioDto) => {
      await this.prisma.intelesignSignatario.create({
        data: {
          nome: sig.nome,
          email: sig.email,
          cpf: sig.cpf,
          envelope_id: registro.id,
        },
      });
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
    const upload = await this.prisma.intelesign.update({
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

  async CreateEnvelope(
    title: string,
    subject: string,
    message: string,
    expireIn: number,
    token: string,
  ) {
    try {
      const url = 'https://api.intellisign.com/v1/envelopes';

      // calcular data de expiração
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expireIn);

      const Body = {
        title: title,
        subject: subject,
        message: message,
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

  /**
   * Desenha a assinatura do sistema em todas as páginas do PDF
   * @param pdfDoc Documento PDF
   * @param assinaturaImage Imagem da assinatura
   */
  private async drawAssinaturaSistema(
    pdfDoc: PDFDocument,
    assinaturaImage: any,
  ) {
    try {
      const pages = pdfDoc.getPages();
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
      const horaFormatada = dataAtual.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const textoAssinatura = `Documento assinado no assinador Intellisign em parceria com Sisnato, documento gerado em ${dataFormatada} às ${horaFormatada}`;

      // Carrega a fonte para o texto
      const { robotoRegular } = await this.loadFonts(pdfDoc);

      for (const page of pages) {
        try {
          const margin = 20;
          const textWidth = robotoRegular.widthOfTextAtSize(textoAssinatura, 8);
          const pageHeight = page.getHeight();
          const pageWidth = page.getWidth();

          // Configurações de rotação e posicionamento
          const rotation = degrees(90); // Rotação de 90 graus
          const x = page.getWidth() - margin; // Posição X no canto direito
          const y = margin * 2; // Posição Y ajustada para o canto inferior

          // Tamanho da fonte reduzido
          const fontSize = 6;
          const lineHeight = fontSize * 1.2; // Espaçamento entre linhas

          // Ajusta o ponto de origem para a rotação
          const originX = x;
          const originY = y;

          // Desenha a imagem da assinatura (se disponível) e o texto
          if (assinaturaImage) {
            // Reduz o tamanho da logo para ficar proporcional ao texto
            const imgDims = assinaturaImage.scale(0.2);
            const imgHeight = imgDims.height * 0.6;

            // Desenha a imagem rotacionada
            page.drawImage(assinaturaImage, {
              x: originX,
              y: originY + 10, // Ajuste fino na posição Y da logo
              width: imgDims.width * 0.8,
              height: imgHeight,
              rotate: rotation,
            });

            // Desenha o texto rotacionado ao lado da imagem
            page.drawText(textoAssinatura, {
              x: originX - 4,
              y: originY + imgDims.width - 10, // Ajusta o espaçamento entre a logo e o texto
              size: fontSize + 1,
              font: robotoRegular,
              color: rgb(0.3, 0.3, 0.3),
              rotate: rotation,
            });
          } else {
            // Apenas o texto se a imagem não estiver disponível
            page.drawText(textoAssinatura, {
              x: originX,
              y: originY,
              size: fontSize,
              font: robotoRegular,
              color: rgb(0.3, 0.3, 0.3),
              rotate: rotation,
            });
          }
        } catch (error) {
          console.error('Erro ao desenhar assinatura na página:', error);
        }
      }
    } catch (error) {
      console.error('Erro no processo de desenho da assinatura:', error);
    }
  }

  async CreateManifesto(
    file: Buffer,
    dadosManifesto: {
      codigoValidacao: string;
      asstype: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
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
      yPosition = await this.drawSignatories(
        page,
        drawText,
        dadosManifesto.signatarios || [],
        yPosition,
        pdfDoc,
      );

      // 10. Desenha as instruções de verificação
      this.drawVerificationInstructions(
        page,
        drawText,
        dadosManifesto,
        yPosition,
        robotoRegular,
      );

      // 11. Adiciona a assinatura do sistema em todas as páginas
      try {
        let assinaturaImage = null;
        const assinaturaPath = path.resolve(
          process.cwd(),
          'src/api/intelesign/public/assinatura.png',
        );

        if (fs.existsSync(assinaturaPath)) {
          const assinaturaBytes = await fs.promises.readFile(assinaturaPath);
          assinaturaImage = await pdfDoc.embedPng(assinaturaBytes);
        }

        await this.drawAssinaturaSistema(pdfDoc, assinaturaImage);
      } catch (error) {
        console.error('Erro ao adicionar assinatura do sistema:', error);
        // Não interrompe o fluxo em caso de erro na assinatura
      }

      // 12. Salva e retorna o PDF
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
      options: {
        bold?: boolean;
        color?: any;
        maxWidth?: number;
        italic?: boolean;
      } = {},
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
      asstype: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
      }[];
      urlVerificacao: string;
      logoPath?: string;
    },
  ) {
    try {
      const urlVerificacao = data.urlVerificacao || '';
      const codigoValidacao = data.codigoValidacao || 'N/A';

      const qrCodeDataUrl = await QRCode.toDataURL(
        `${urlVerificacao}/${codigoValidacao}`,
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
      asstype: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
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
          'src/api/intelesign/public/Logo_Sisnato_013.png',
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

    // O ícone da ICP Brasil foi movido para aparecer antes do nome de cada signatário

    // 3. Título centralizado
    const title = 'Manifesto de\nAssinatura Digital';
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

  async drawSignatories(
    page: any,
    drawText: Function,
    signatarios: {
      nome: string; // Nome do signatário
      email: string; // Email do signatário
      cpf: string; // CPF do signatário
    }[],
    yPosition: number,
    pdfDoc?: any, // Adicionando parâmetro opcional para o PDFDoc
  ) {
    const { MARGIN, COLORS, FONT_SIZES, ELEMENTS } = this.LAYOUT;
    const ICON_SIZE = 16; // Tamanho do ícone da ICP Brasil
    const SPACING = 4; // Espaçamento entre elementos

    // Carrega as imagens necessárias
    let icpLogoImage = null;
    let checkMarkImage = null;

    if (pdfDoc) {
      try {
        // Carrega o logo da ICP Brasil
        const icpLogoPath = path.resolve(
          process.cwd(),
          'src/api/intelesign/public/icp-brasil.png',
        );

        // Carrega a imagem do check
        const checkMarkPath = path.resolve(
          process.cwd(),
          'src/api/intelesign/public/check-mark.png',
        );

        if (fs.existsSync(icpLogoPath)) {
          const icpLogoBytes = await fs.promises.readFile(icpLogoPath);
          icpLogoImage = await pdfDoc.embedPng(icpLogoBytes);
        }

        if (fs.existsSync(checkMarkPath)) {
          const checkMarkBytes = await fs.promises.readFile(checkMarkPath);
          checkMarkImage = await pdfDoc.embedPng(checkMarkBytes);
        }
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
      }
    }

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
      // Desenha o ícone de check
      if (checkMarkImage) {
        // Ajusta o tamanho do ícone para caber dentro do checkbox
        const checkSize = ELEMENTS.CHECKBOX_SIZE * 0.9; // 80% do tamanho do checkbox
        const checkX = MARGIN + (ELEMENTS.CHECKBOX_SIZE - checkSize) / 2;
        const checkY = yPosition - 2 + (ELEMENTS.CHECKBOX_SIZE - checkSize) / 2;

        page.drawImage(checkMarkImage, {
          x: checkX,
          y: checkY,
          width: checkSize,
          height: checkSize,
        });
      } else {
        // Fallback para texto caso a imagem não carregue
        drawText('✓', MARGIN + 5, yPosition + 3, 12, {
          color: COLORS.WHITE,
          bold: true,
        });
      }

      // Posição inicial para o ícone e texto do signatário
      let currentX = MARGIN + ELEMENTS.CHECKBOX_SIZE + SPACING;

      // Desenha o logo da ICP Brasil
      if (icpLogoImage) {
        // Calcula as dimensões mantendo a proporção
        const logoHeight = ICON_SIZE;
        const logoWidth =
          (icpLogoImage.width / icpLogoImage.height) * logoHeight;

        // Desenha o logo
        page.drawImage(icpLogoImage, {
          x: currentX,
          y: yPosition - 1,
          width: logoWidth,
          height: logoHeight,
        });

        // Ajusta a posição X para o texto do signatário
        currentX += logoWidth + SPACING;
      } else {
        // Fallback: desenha um retângulo com o texto "ICP" se o logo não estiver disponível
        page.drawRectangle({
          x: currentX,
          y: yPosition - 1,
          width: ICON_SIZE * 1.5,
          height: ICON_SIZE,
          color: rgb(0.9, 0.9, 0.9),
          borderColor: COLORS.BLACK,
          borderWidth: 0.5,
        });

        drawText('ICP', currentX + 4, yPosition + 3, 8, {
          color: COLORS.BLACK,
          bold: true,
        });

        currentX += ICON_SIZE * 1.5 + SPACING;
      }

      // Nome e CPF do signatário
      const nome = signatario.nome || 'Nome não informado';
      const cpf = signatario.cpf
        ? this.formatCPF(signatario.cpf)
        : 'CPF não informado';
      const signatarioTexto = `${nome} - ${cpf}`;

      drawText(signatarioTexto, currentX, yPosition, FONT_SIZES.NORMAL);

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
      asstype: string;
      signatarios: {
        nome: string;
        email: string;
        cpf: string;
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

    // Adiciona texto condicional para assinatura não qualificada
    if (data.asstype !== 'qualified') {
      yPosition -= 20; // Espaçamento adicional
      const notaAssinatura = 'Documento com validação e assinatura simples';
      drawText(notaAssinatura, MARGIN, yPosition, FONT_SIZES.NORMAL, {
        color: COLORS.GRAY,
        italic: true,
      });
    }
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

  // Tipos de assinatura suportados pela API do InteliSign
  private readonly TIPOS_ASSINATURA = {
    SIMPLE: 'simple',
    QUALIFIED: 'qualified',
  } as const;

  // Interface para o objeto Signatário
  private signatario: {
    email: string;
    nome: string;
    cpf: string;
  };

  /**
   * Adiciona um signatário a um envelope existente no InteliSign
   * @param signatario Dados do signatário
   * @param tipoAssinatura Tipo de assinatura a ser utilizada
   * @param index Índice do signatário na ordem de roteamento
   * @param envelopeId ID do envelope no InteliSign
   * @param token Token de autenticação
   * @returns Dados do signatário adicionado
   */
  async addSignatarios(
    signatario: { email: string; nome: string; cpf: string },
    tipoAssinatura: string, // Aceita string genérica para maior flexibilidade
    index: number,
    envelopeId: string,
    token: string,
  ): Promise<any> {
    // Validações iniciais
    if (!signatario) {
      throw new Error('Nenhum signatário fornecido');
    }

    if (!signatario.email || !signatario.nome || !signatario.cpf) {
      throw new Error(
        'Dados do signatário incompletos. É necessário informar email, nome e CPF.',
      );
    }

    if (typeof index !== 'number' || index < 0) {
      throw new Error('Índice do signatário inválido');
    }

    if (!envelopeId) {
      throw new Error('ID do envelope não fornecido');
    }

    if (!token) {
      throw new Error('Token de autenticação não fornecido');
    }

    try {
      // Formata o CPF (remove caracteres não numéricos)
      const cpfFormatado = signatario.cpf.replace(/\D/g, '');

      // Valida o formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signatario.email)) {
        throw new Error('Formato de email inválido');
      }

      // Valida o formato do CPF (apenas verifica se tem 11 dígitos)
      if (cpfFormatado.length !== 11) {
        throw new Error('CPF deve conter 11 dígitos');
      }

      // Obtém o tipo de assinatura, usando 'simple' como padrão se não for encontrado
      const tipoAssinaturaValido = Object.values(
        this.TIPOS_ASSINATURA,
      ).includes(tipoAssinatura as any)
        ? tipoAssinatura
        : this.TIPOS_ASSINATURA.SIMPLE;

      // Prepara o corpo da requisição
      const requestBody = {
        type: 'signer',
        signature_type: tipoAssinaturaValido,
        routing_order: index + 1,
        addressees: [
          {
            via: 'email',
            value: signatario.email.trim(),
            name: signatario.nome.trim(),
            identifiers: [
              {
                code: 'CPF',
                is_required: true,
                value: cpfFormatado,
              },
            ],
          },
        ],
      };

      console.log(
        `[IntelesignService] Adicionando signatário ao envelope ${envelopeId}`,
        {
          email: signatario.email,
          tipoAssinatura: requestBody.signature_type,
          routingOrder: requestBody.routing_order,
        },
      );

      // Faz a requisição para a API do InteliSign
      const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}/recipients`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Erro na resposta da API do InteliSign:', {
          status: response.status,
          statusText: response.statusText,
          data: JSON.stringify(responseData),
          requestBody: JSON.stringify(requestBody),
        });

        throw new Error(
          responseData.message ||
            `Erro ao adicionar signatário: ${response.status} ${response.statusText}`,
        );
      }

      console.log(`[IntelesignService] Signatário adicionado com sucesso`, {
        envelopeId,
        recipientId: responseData.id,
        email: signatario.email,
      });

      // Atualiza o registro do signatário no banco de dados com o ID retornado
      try {
        const signatarioExistente =
          await this.prisma.intelesignSignatario.findFirst({
            where: { cpf: cpfFormatado },
          });

        if (signatarioExistente) {
          await this.prisma.intelesignSignatario.update({
            where: { id: signatarioExistente.id },
            data: { UUID: responseData.id },
          });

          console.log(
            `[IntelesignService] Signatário atualizado no banco de dados`,
            {
              id: signatarioExistente.id,
              UUID: responseData.id,
            },
          );
        } else {
          console.warn(
            '[IntelesignService] Signatário não encontrado no banco de dados para atualização',
            {
              cpf: cpfFormatado,
            },
          );
        }
      } catch (dbError) {
        // Não falha a operação principal se houver erro ao atualizar o banco
        console.error(
          '[IntelesignService] Erro ao atualizar signatário no banco de dados:',
          dbError,
        );
      }

      return responseData;
    } catch (error) {
      console.error('[IntelesignService] Erro ao adicionar signatário:', {
        error: error.message,
        stack: error.stack,
        signatario: {
          email: signatario?.email,
          nome: signatario?.nome,
          cpf: signatario?.cpf,
        },
        envelopeId,
        tipoAssinatura,
      });

      throw new Error(`Falha ao adicionar signatário: ${error.message}`);
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

  async GetFinanceira(id: number): Promise<boolean> {
    const financeira = await this.prisma.financeiro.findUnique({
      where: {
        id: id,
        Intelesign_status: true,
      },
    });
    return !!financeira;
  }

  async GetStatus(uuid: string, token: string) {
    try {
      const url = `https://api.intellisign.com/v1/envelopes/${uuid}?extended=true`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Erro ao buscar status: ${JSON.stringify(data)}`);
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      throw new Error(`Erro ao buscar status: ${error.message}`);
    }
  }

  async IsExist(cpf: string) {
    try {
      const Exist = await this.prisma.solicitacao.findMany({
        where: {
          cpf: cpf,
          OR: [
            {
              andamento: {
                notIn: ['APROVADO', 'EMITIDO', 'REVOGADO'],
              },
            },
            { ativo: true },
          ],
        },
      });
      if (!Exist) {
        return this.createResponse('CPF nao encontrado', 200, null);
      }
      return this.createResponse('CPF encontrado', 200, Exist);
    } catch (error) {
      const message = error.message ? error.message : 'Erro Desconhecido';
      const retorno = {
        message,
      };
      throw new HttpException(retorno, 500);
    }
  }

  async download(id: string): Promise<Buffer> { 
    try {
      const token = await this.refreshToken();
      const url = `https://api.intellisign.com/v1/envelopes/${id}/download`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.arrayBuffer();
      console.log("🚀 ~ IntelesignService ~ download ~ data:", data)
      if (!response.ok) {
        throw new Error(`Erro ao buscar status: ${JSON.stringify(data)}`);
      }
      return Buffer.from(data);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      throw new Error(`Erro ao buscar status: ${error.message}`);
    }
  }
}
