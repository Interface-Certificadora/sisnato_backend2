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

      // 1. Busca a solicitação ativa e não distratada
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
          direto: true,
        },
      });

      if (!solicitacao) {
        return {
          existe: false,
          nome: null,
          documento: null,
          forma_pagamento: null,
          certificados: [],
          status: null,
        };
      }

      // 2. Busca os metadados ricos do certificado no FCWeb via Sequelize
      let certificadosMapeados = [];
      let formaPagamentoDetectada = null;

      if (solicitacao.id_fcw) {
        const dadosCertificado = await this.fcwebProvider.findIdfMinRelat(
          solicitacao.id_fcw,
        );

        if (dadosCertificado && dadosCertificado.length > 0) {
          formaPagamentoDetectada = dadosCertificado[0].formapgto;
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

      // 3. Tradução precisa baseada nos status reais do seu ecossistema
      let statusTraduzido = 'aguardando validação';

      // Regra da Venda Direta: Só acusa falta de pagamento se for explicitamente 'direto'
      if (!solicitacao.pg_status && solicitacao.direto) {
        statusTraduzido = 'aguardando pagamento';
      } else if (
        solicitacao.andamento === 'EMITIDO' ||
        solicitacao.andamento === 'APROVADO'
      ) {
        statusTraduzido = 'concluído';
      } else if (solicitacao.andamento === 'REVOGADO') {
        statusTraduzido = 'revogado';
      } else if (
        solicitacao.andamento === 'REAGENDAMENTO' ||
        solicitacao.andamento === 'NOVA FC' ||
        solicitacao.andamento === 'REPRESAMENTO'
      ) {
        statusTraduzido = 'em emissão';
      }

      return {
        existe: true,
        nome: solicitacao.nome,
        documento: solicitacao.cpf,
        forma_pagamento: formaPagamentoDetectada,
        certificados: certificadosMapeados,
        status: statusTraduzido,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Erro interno ao mapear estados do cliente.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
