import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateIntelesignDto,
  SignatarioDto,
} from './dto/create-intelesign.dto';
import { UpdateIntelesignDto } from './dto/update-intelesign.dto';
import { addSignatarios } from './lib/add_siguinatario';
import { criaEnvelope } from './lib/cria_envelope';
import { buildManifest } from './lib/manifest_bilder';
import { refreshToken } from './lib/refresh_token';
import saveOriginal from './lib/save_original';
import { sendEnvelop } from './lib/send_envelop';
import { uploadManifesto } from './lib/upload_manifest';
import { response } from 'express';
import { getStatusEnvelope } from './lib/get_status_envelope';
import { UserPayload } from 'src/auth/entities/user.entity';

@Injectable()
export class IntelesignService {
  constructor(private prismaService: PrismaService) {}

  private createErrorResponse(message: string) {
    return {
      error: true,
      message,
      data: null,
      total: 0,
      page: 0,
    };
  }

  async create(
    createIntelesignDto: CreateIntelesignDto,
    file: Express.Multer.File,
  ): Promise<{
    error: boolean;
    message: string;
    data: { download: string; preview: string };
    total: number;
    page: number;
  }> {
    try {
      // Validação básica do arquivo
      if (!file) {
        throw new Error('Arquivo não fornecido');
      }

      const NomeOriginal = file.originalname;
      const Tamanho = file.size;
      const Tipo = file.mimetype;

      // Garantir que o buffer seja do tipo correto
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

      const requestToken = await refreshToken();
      // Salvar arquivo original
      const save = await saveOriginal(
        file,
        NomeOriginal,
        Tamanho,
        Tipo,
        'intelesign-original',
      );

      // criara registro no banco
      const registro = await this.prismaService.write.intelesign.create({
        data: {
          original_name: NomeOriginal,
          doc_original_down: save.url_download,
          doc_original_viw: save.url_view,
          signatarios: {
            connect: createIntelesignDto.signatarios?.map((sig: any) => ({
              id: sig.id,
            })),
          },
          cca_id: createIntelesignDto.cca_id,
        },
        include: {
          signatarios: {
            include: {
              empreendimento: true,
            },
          },
        },
      });

      const signatariosRegistros = registro.signatarios;
      const listaSignatarios = createIntelesignDto.signatarios?.map(
        (sig: SignatarioDto) => {
          const filtro = signatariosRegistros.find((s: any) => s.id === sig.id);
          return {
            ...filtro,
            asstype: sig.asstype,
            type: sig.type,
          };
        },
      );

      const empreendimentoName =
        registro.signatarios[0].empreendimento.nome || '';

      // criar envelope
      const envelope = await criaEnvelope(
        empreendimentoName,
        7,
        requestToken.access_token,
      );

      if (!envelope.id) {
        throw new Error(`Erro ao criar envelope => ${envelope.message}`);
      }

      const TesteEmail = [
        'kingdevtec@gmail.com',
        'killerxandy@gmail.com',
        'kingdever88@gmail.com',
      ];

      // Preparar dados dos signatários (exemplo com dados do DTO)
      const signatarios = listaSignatarios?.map((sig: any, index: number) => ({
        nome: sig.nome,
        // email: sig.email,
        email: TesteEmail[index],
        cpf: sig.cpf.replace(/\D/g, ''),
        asstype: sig.asstype,
        type: sig.type,
      }));

      const dadosManifesto = {
        codigoValidacao: envelope.id,
        signatarios,
        urlVerificacao: `https://app.intellisign.com/business/documents/info/`,
      };

      // Criar o manifesto
      const manifest = await buildManifest(file.buffer, dadosManifesto);

      // upload manifesto para o envelope
      const upload = await uploadManifesto(
        envelope.id,
        manifest,
        NomeOriginal,
        requestToken.access_token,
      );

      // update registro
      await this.prismaService.write.intelesign.update({
        where: {
          id: registro.id,
        },
        data: {
          UUID: envelope.id,
          hash: upload.sha1,
          doc_modificado_down: upload.links.download,
          doc_modificado_viw: upload.links.display,
        },
      });

      await addSignatarios(signatarios, envelope.id, requestToken.access_token);
      await sendEnvelop(envelope.id, requestToken.access_token);

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
      console.log('🚀 ~ IntelesignService ~ create ~ retorno:', retorno);

      return retorno;
    } catch (error) {
      throw new HttpException(
        this.createErrorResponse(error.message || 'Erro ao criar envelope'),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll({
    page,
    limit,
    status,
    id,
    signatario,
    date_created,
    id_cca,
    User,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    id?: number;
    signatario?: string;
    date_created?: string;
    id_cca?: number;
    User: UserPayload;
  }) {
    try {
      if (!User.id) {
        throw new Error('User not found');
      }
      const LimitGlobal = limit || 25;
      const PageGlobal = page || 1;
      const aproveFinace = await this.prismaService.read.financeiro.findMany({
        where: {
          id: {
            in: User.Financeira,
          },
          Intelesign_status: true,
        },
        select: {
          id: true,
        },
      });

      const financeiraIds = aproveFinace.map((financeira) => financeira.id);
      const envelopes = await this.prismaService.read.intelesign.findMany({
        where: {
          ...(status && { status: status }),
          ...(id && { id: id }),
          ...(signatario && {
            signatarios: { some: { nome: { contains: signatario } } },
          }),
          ...(id_cca && { cca_id: Number(id_cca) }),
          ...(User.hierarquia !== 'ADM' && {
            cca_id: { in: financeiraIds },
            ativo: true,
          }),
          ...(date_created && { createdAt: date_created }),
        },
        select: {
          id: true,
          UUID: true,
          doc_modificado_down: true,
          doc_modificado_viw: true,
          status: true,
          status_view: true,
          valor: true,
          signatarios: {
            select: {
              id: true,
              nome: true,
            },
          },
          cca: {
            select: {
              id: true,
              fantasia: true,
            },
          },
        },
        skip: (PageGlobal - 1) * LimitGlobal,
        take: LimitGlobal,
      });

      const requestToken = await refreshToken();

      const updateEnvelopes = [];
      for (const envelope of envelopes) {
        if (envelope.status === 'done') return;
        const status = await getStatusEnvelope(
          envelope.UUID,
          requestToken.access_token,
        );

        if (!status) return;
        const statusView =
          status === 'waiting' || status === 'in-transit'
            ? 'Aguardando'
            : status === 'signing'
              ? 'Assinando'
              : status === 'rejected'
                ? 'Rejeitado'
                : status === 'failed'
                  ? 'Falhou'
                  : status === 'suspended'
                    ? 'Suspensão'
                    : 'Concluído';

        await this.prismaService.write.intelesign.update({
          where: {
            id: envelope.id,
          },
          data: {
            status: status,
            status_view: statusView,
          },
        });
        updateEnvelopes.push({
          ...envelope,
          status: status,
          status_view: statusView,
        });
      }

      return {
        error: false,
        message: 'Envelopes atualizados com sucesso',
        total: updateEnvelopes.length,
        page: 1,
        data: updateEnvelopes,
      };
    } catch (error) {
      throw new HttpException(
        this.createErrorResponse(error.message || 'Erro ao buscar envelopes'),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const envelope = await this.prismaService.read.intelesign.findUnique({
        where: {
          id: id,
        },
        include: {
          signatarios: true,
          cca: true,
        },
      });
      const requestToken = await refreshToken();
      const status = await getStatusEnvelope(
        envelope.UUID,
        requestToken.access_token,
      );

      if (!status)
        return {
          error: true,
          message: 'Envelope não encontrado',
          data: envelope,
          total: 1,
          page: 1,
        };

      const statusView =
        status === 'waiting' || status === 'in-transit'
          ? 'Aguardando'
          : status === 'signing'
            ? 'Assinando'
            : status === 'rejected'
              ? 'Rejeitado'
              : status === 'failed'
                ? 'Falhou'
                : status === 'suspended'
                  ? 'Suspensão'
                  : 'Concluído';

      await this.prismaService.write.intelesign.update({
        where: {
          id: envelope.id,
        },
        data: {
          status: status,
          status_view: statusView,
        },
      });

      envelope.status = status;
      envelope.status_view = statusView;

      return {
        error: false,
        message: 'Envelope encontrado',
        data: envelope,
        total: 1,
        page: 1,
      };
    } catch (error) {
      throw new HttpException(
        this.createErrorResponse(error.message || 'Erro ao buscar envelope'),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  update(id: number, updateIntelesignDto: UpdateIntelesignDto) {
    return `This action updates a #${id} intelesign`;
  }

  remove(id: number) {
    try {
      const envelope = this.prismaService.write.intelesign.delete({
        where: {
          id: id,
        },
      });
      return {
        error: false,
        message: 'Envelope removido com sucesso',
        data: envelope,
        total: 1,
        page: 1,
      };
    } catch (error) {
      throw new HttpException(
        this.createErrorResponse(error.message || 'Erro ao buscar envelope'),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
