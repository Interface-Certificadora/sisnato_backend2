import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from './utils/utils.service';
import { FiltroDashboardDto } from './dto/filtro-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private utils: UtilsService,
  ) {}

  async getDashboard() {
    try {
      const contagem = await this.utils.getDashboardData();
      const tags = await this.utils.GetAlertasCreated();

      return {
        contagem,
        tags,
        summary: {
          totalGeral: contagem.reduce((a, b) => a + b.total, 0),
          totalVideo: contagem.reduce((a, b) => a + b.video, 0),
          totalPresencial: contagem.reduce((a, b) => a + b.presencial, 0),
        },
      };
    } catch (error) {
      console.error('Erro no Search Dashboard:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDashboardSearch(filtro: FiltroDashboardDto) {
    try {
      const solicitacoes = await this.utils.GetSolicitacoesSearch(filtro);

      // Contadores inicializados
      let videoTotal = 0;
      let internaTotal = 0;
      let rgCont = 0;
      let cnhCont = 0;

      // Unico loop para processar tudo (O(n)) - Muito mais rápido
      solicitacoes.forEach((item) => {
        // Lógica de Vídeo vs Interna
        const type = item.type_validacao || '';
        if (type.includes('VIDEO GT') || type.includes('VIDEO CONF')) {
          videoTotal++;
        } else {
          internaTotal++;
        }

        // Lógica de Documentos (Baseado no seu fcweb provider)
        if (item.fcweb) {
          if (item.fcweb.reg_cnh && item.fcweb.reg_cnh !== '') {
            cnhCont++;
          } else if (item.fcweb.rg && item.fcweb.rg !== null) {
            rgCont++;
          }
        }
      });

      const suporteCont = await this.utils.ContabilizarSuporte(solicitacoes);
      const media = await this.utils.TimeOutMes(solicitacoes);

      return {
        construtora: filtro.construtora,
        empreedimento: filtro.empreedimento,
        financeiro: filtro.financeiro,
        total_solicitacao: solicitacoes.length,
        time: media,
        total_vc: videoTotal,
        total_int: internaTotal,
        rg: rgCont,
        cnh: cnhCont,
        suporte: suporteCont.total_suporte,
        suporte_tag: suporteCont.lista_suporte,
        erros: suporteCont.total_tag,
        erros_tag: suporteCont.lista_tags,
      };
    } catch (error) {
      console.error('Erro no Search Dashboard:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getEmpreendimentos() {
    try {
      return await this.prisma.empreendimento.findMany({
        where: { status: true },
        select: { id: true, nome: true },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar empreendimentos';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getConstrutoras() {
    try {
      return await this.prisma.construtora.findMany({
        where: { id: { gt: 1 }, status: true },
        select: { id: true, fantasia: true },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar construtoras';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFinanceiras() {
    try {
      return await this.prisma.financeiro.findMany({
        where: { status: true },
        select: { id: true, fantasia: true },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar financeiras';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
