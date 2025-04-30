import { HttpException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { CreateRelatorioDto } from './dto/relatorio.tdo';
import { PdfCreateService } from 'src/pdf_create/pdf_create.service';
import { S3Service } from 'src/s3/s3.service';
import { UpdateRelatorioFinanceiroDto } from './dto/update-relatorio_financeiro.dto';

type Construtora = {
  id: number;
  email: string | null;
  obs: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  cnpj: string;
  razaosocial: string;
  fantasia: string | null;
  tel: string | null;
  status: boolean;
  valor_cert: number | null;
  responsavelId: number | null;
  atividade: string | null;
};

@Injectable()
export class RelatorioFinanceiroService {
  constructor(
    private Prisma: PrismaService,
    private fcwebProvider: FcwebProvider,
    private readonly PdfCreate: PdfCreateService,
    private readonly S3: S3Service,
  ) {}

  async create(data: CreateRelatorioDto) {
    try {
      const { ConstrutoraId, Inicio, Fim, SituacaoId } = data;

      const lista = await this.ListaSolicitacoes(
        ConstrutoraId,
        Inicio,
        Fim,
        SituacaoId,
      );

      const Construtora = await this.Prisma.construtora.findUnique({
        where: {
          id: ConstrutoraId,
        },
      });

      const Dados = [];

      // Refatoração: loop for...of para garantir await e preenchimento correto do array Dados
      for (const solicitacao of lista) {
        if (solicitacao.id_fcw) {
          const fcweb = await this.GetAllFcweb(solicitacao.cpf);
          // Cria novo objeto com campos extras, conforme boas práticas
          const solicitacaoCompleta = {
            ...solicitacao,
            andamento: fcweb[0].andamento,
            status: fcweb[0].formapgto,
            dt_agendamento: fcweb[0].dt_agenda,
            hr_agendamento: fcweb[0].hr_agenda,
            dt_aprovacao: fcweb[0].dt_aprovacao,
            hr_aprovacao: fcweb[0].hr_aprovacao,
            dt_revogacao: fcweb[0].dt_revogacao,
            tipocd: fcweb[0].tipocd,
            validacao: fcweb[0].validacao,
            valor_cert: fcweb[0].valor_cert,
            total: fcweb.length || 0,
            modelo: fcweb[0].modelo || '',
            fichas: fcweb,
          };
          if (solicitacaoCompleta.andamento === 'REVOGADO') {
            const dt_revogacao = new Date(solicitacaoCompleta.dt_revogacao);
            const dt_aprovacao = new Date(solicitacaoCompleta.dt_aprovacao);
            const diff = dt_revogacao.getTime() - dt_aprovacao.getTime();
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (diffDays > 6) {
              Dados.push(solicitacaoCompleta);
            }
          } else {
            Dados.push(solicitacaoCompleta);
          }
        }
      }
      const protocolo = new Date()
        .toISOString()
        .split('.')[0]
        .replace(/\D/g, '');
      // pegar o Dados e verificar qual o modelo qua mais aparece, e retornar o modelo
      const modelo2 = Dados.map((solicitacao) => solicitacao.modelo);
      const modelo = modelo2[0] || '';

      // Extraia todos os ids dos empreendimentos
      const empreendimentosIds = Dados.map(
        (solicitacao) => solicitacao.empreendimento.id,
      );

      // Crie um Set para garantir unicidade dos ids
      const idsUnicos = Array.from(new Set(empreendimentosIds));

      // Array para armazenar os dados finais
      const empreendimentosArray = [];

      // Para cada id único, processe os dados relacionados
      for (const id of idsUnicos) {
        // Filtra todas as solicitações daquele empreendimento
        const empreendimentoData = Dados.filter(
          (solicitacao) => solicitacao.empreendimento.id === id,
        );

        // Soma o total das solicitações
        const total = empreendimentoData.reduce(
          (acc, item) => acc + item.total,
          0,
        );

        const SetEmpreendimento =  empreendimentoData.map((solicitacao) => {
          const filtro = solicitacao.fichas.filter((f:any) => f.formapgto 
          === 'PENDURA')
          const soma = filtro.reduce((acc: number, item: { valorcd: string; }) => acc + parseFloat(item.valorcd.replace(',', '.')), 0)
          
         
          return {
            ...solicitacao,
            valor_total_cert: soma,
          };
        });

        // Monta o objeto final
        empreendimentosArray.push({
          id,
          nome: empreendimentoData[0].empreendimento.nome,
          cidade: empreendimentoData[0].empreendimento.cidade,
          total,
          valor: SetEmpreendimento.reduce((acc, item) => acc + item.valor_total_cert, 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
          solicitacoes: SetEmpreendimento,
        });
      }

      const totalCert = empreendimentosArray.reduce(
        (acc, item) => acc + item.total,
        0,
      );

      const dados = {
        protocolo: protocolo,
        situacao_pg: 1,
        solicitacao: empreendimentosArray,
        construtoraId: ConstrutoraId,
        total_cert: totalCert,
        valorTotal: parseFloat((totalCert * Construtora.valor_cert).toFixed(2)),
        start: new Date(Inicio),
        end: new Date(Fim),
        modelo: modelo,
      };
      // fs.writeFileSync(`./${protocolo}.json`, JSON.stringify(dados, null, 2));

      await this.Prisma.relatorio_financeiro.create({
        data: dados,
      });

      //TODO: enviar para microservice alterar status das solicitacoes e fcweb

      return 'Relatório criado com sucesso';
    } catch (error) {
      console.log('🚀 ~ RelatorioFinanceiroService ~ create ~ error:', error);
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async relatorioFinanceiroPdf(Protocolo: string) {
    const relatorio = await this.Prisma.relatorio_financeiro.findUnique({
      where: {
        protocolo: Protocolo,
      },
      include: {
        construtora: true,
      },
    });

    // fs.writeFileSync(`./${Protocolo}.json`, JSON.stringify(relatorio, null, 2));
    if (!relatorio) {
      throw new HttpException('Relatório não encontrado', 404);
    }
    if (!relatorio.pdf) {
      const { fileName } = await this.PdfCreate.GerarRelatorioPdf(
        Protocolo,
        relatorio.construtora,
        relatorio.valorTotal,
        relatorio.solicitacao as any,
      );
      await this.Prisma.relatorio_financeiro.update({
        where: {
          protocolo: Protocolo,
        },
        data: {
          pdf: fileName,
        },
      });
      return fileName;
    } else {
      return relatorio.pdf;
    }
  }

  async relatorioFinanceiroXlsx(Protocolo: string) {
    const relatorio = await this.Prisma.relatorio_financeiro.findUnique({
      where: {
        protocolo: Protocolo,
      },
      include: {
        construtora: true,
      },
    });
    // fs.writeFileSync(`./${Protocolo}.json`, JSON.stringify(relatorio, null, 2));
    if (!relatorio) {
      throw new HttpException('Relatório não encontrado', 404);
    }
    if (!relatorio.xlsx) {
      const req = await this.PdfCreate.createXlsx(
        relatorio.construtora,
        relatorio.construtora.valor_cert,
        relatorio.valorTotal,
        relatorio.total_cert,
        Protocolo,
        relatorio.solicitacao as any,
      );
      await this.Prisma.relatorio_financeiro.update({
        where: {
          protocolo: Protocolo,
        },
        data: {
          xlsx: req,
        },
      });

      return req;
    } else {
      return relatorio.xlsx;
    }
  }

  async findAll() {
    try {
      const relatorio = await this.Prisma.relatorio_financeiro.findMany({
        orderBy: {situacao_pg: 'desc'},
        select: {
          id: true,
          protocolo: true,
          valorTotal: true,
          dt_pg: true,
          situacao_pg: true,
          xlsx: true,
          pdf: true,
          createAt: true,
          construtora: {
            select:{
              id: true,
              fantasia: true,
              razaosocial: true,
            },
          },
        },
      });
      return relatorio;
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async findOne(id: number) {
    try {
      const relatorio = await this.Prisma.relatorio_financeiro.findUnique({
        where: {
          id: id,
        },
        include:{
          construtora: true,
        }
      });
      if (!relatorio) {
       throw new Error('Relatório não encontrado');
      }
      return relatorio;
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }
  async findOneProtocol(protocolo: string) {
    try {
      const relatorio = await this.Prisma.relatorio_financeiro.findUnique({
        where: {
          protocolo: protocolo,
        },
        include:{
          construtora: true,
        }
      });
      if (!relatorio) {
        throw new Error('Relatório não encontrado');
      }
      return relatorio;
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async update(id: number, data: UpdateRelatorioFinanceiroDto) {
   try {
    const relatorio = await this.Prisma.relatorio_financeiro.update({
      where: {
        id: id,
      },
      data: data,
    });
    return relatorio;
   } catch (error) {
    const retorno = {
      message: error.message,
    };
    throw new HttpException(retorno, 400);
   }
  }

  async remove(id: number) {
    try {
      await this.Prisma.relatorio_financeiro.delete({
        where: {
          id: id,
        },
      });
      return 'Relatório excluido com sucesso';
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  // async RelatorioFinanceiro(data: CreateRelatorioDto) {
  //   const { ConstrutoraId, Inicio, Fim, SituacaoId } = data;

  //   const relatorio = await this.Prisma.solicitacao.findMany({
  //     where: {
  //       construtoraId: ConstrutoraId,
  //       situacao_pg: SituacaoId,
  //       ...(Fim
  //         ? {
  //             createdAt: {
  //               gte: new Date(Inicio),
  //               lte: new Date(Fim),
  //             },
  //           }
  //         : {
  //             createdAt: {
  //               gte: new Date(Inicio),
  //             },
  //           }),
  //       andamento: {
  //         in: ['APROVADO', 'EMITIDO', 'REVOGADO'],
  //       },
  //       dt_aprovacao: {
  //         not: null,
  //       },
  //     },
  //   });

  //   return relatorio;
  // }

  async ListaSolicitacoes(
    ConstrutoraId: number,
    Inicio: string,
    Fim: string | null,
    SituacaoId: number,
  ) {
    try {
      const relatorio = await this.Prisma.solicitacao.findMany({
        where: {
          construtoraId: ConstrutoraId,
          situacao_pg: SituacaoId,
          ...(Fim
            ? {
                dt_aprovacao: {
                  gte: new Date(Inicio),
                  lte: new Date(Fim),
                },
              }
            : {
                dt_aprovacao: {
                  gte: new Date(Inicio),
                },
              }),
          andamento: {
            in: ['APROVADO', 'EMITIDO', 'REVOGADO'],
          },
        },
        select: {
          id: true,
          cpf: true,
          nome: true,
          dt_aprovacao: true,
          andamento: true,
          dt_agendamento: true,
          hr_agendamento: true,
          dt_revogacao: true,
          id_fcw: true,
          financeiro: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
              cidade: true,
            },
          },
          construtora: {
            select: {
              id: true,
              fantasia: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nome: true,
              telefone: true,
            },
          },
        },
      });

      return relatorio;
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async UpdateSolicitacao(cpf: string) {
    try {
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async GetAllFcweb(cpf: string): Promise<
    {
      id: number;
      andamento: string;
      dt_agenda: Date;
      hr_agenda: string;
      dt_aprovacao: Date;
      hr_aprovacao: string;
      dt_revogacao: Date;
      modelo: string;
      validacao: string;
      valor_cert: number;
      formapgto: string;
      tipocd: string;
    }[]
  > {
    try {
      const fcweb = await this.fcwebProvider.findAllCpfMin(cpf);
      if (!fcweb) {
        throw new Error(`Registro com cpf ${cpf} não encontrado`);
      }
      return fcweb;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

}
