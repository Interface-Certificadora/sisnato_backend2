import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FcwebProvider } from '../../sequelize/providers/fcweb';

@Injectable()
export class AgenteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcwebProvider: FcwebProvider,
  ) {}

  async buscarClientePorTelefone(telefone: string) {
    try {
      const telefoneLimpo = telefone.replace(/\D/g, '');

      const solicitacao = await this.prisma.solicitacao.findFirst({
        where: {
          telefone: {
            contains: telefoneLimpo,
          },
          ativo: true,
          distrato: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          nome: true,
          cpf: true,
          andamento: true,
          pg_status: true,
          id_fcw: true,
        },
      });

      if (!solicitacao) {
        return {
          existe: false,
          nome: null,
          documento: null,
          certificados: [],
          status: null,
        };
      }

      let certificadosMapeados = [];
      if (solicitacao.id_fcw) {
        const dadosCertificado = await this.fcwebProvider.findIdfMinRelat(
          solicitacao.id_fcw,
        );

        if (dadosCertificado && dadosCertificado.length > 0) {
          certificadosMapeados = dadosCertificado.map((cert) => ({
            id: cert.id,
            status_certificado: cert.andamento,
            modelo: cert.modelo,
            validacao: cert.validacao,
            forma_pagamento: cert.formapgto,
          }));
        } else {
          certificadosMapeados = [{ id: solicitacao.id_fcw }];
        }
      }

      let statusTraduzido = 'aguardando validação';
      if (!solicitacao.pg_status) {
        statusTraduzido = 'aguardando pagamento';
      } else if (
        solicitacao.andamento === 'EMITIDO' ||
        solicitacao.andamento === 'APROVADO'
      ) {
        statusTraduzido = 'concluído';
      } else if (solicitacao.andamento === 'REVOGADO') {
        statusTraduzido = 'revogado';
      }

      return {
        existe: true,
        nome: solicitacao.nome,
        documento: solicitacao.cpf,
        certificados: certificadosMapeados,
        status: statusTraduzido,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Erro interno ao cruzar informações de base do cliente.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
