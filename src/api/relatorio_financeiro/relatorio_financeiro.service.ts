import { HttpException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { CreateRelatorioDto } from './dto/relatorio.tdo';
import { PdfCreateService } from 'src/pdf_create/pdf_create.service';

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
  ) {}

  async create(data: CreateRelatorioDto) {
    try {
      const { ConstrutoraId, EmpreendimentoId, Inicio, Fim, SituacaoId } = data;

      const lista = await this.ListaSolicitacoes(
        ConstrutoraId,
        EmpreendimentoId,
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
      let total = 0;

      // Refatoração: loop for...of para garantir await e preenchimento correto do array Dados
      for (const solicitacao of lista) {
        if (solicitacao.id_fcw) {
          const fcweb = await this.GetAllFcweb(solicitacao.cpf);
          // Cria novo objeto com campos extras, conforme boas práticas
          const solicitacaoCompleta = {
            ...solicitacao,
            andamento: fcweb[0].andamento,
            dt_agendamento: fcweb[0].dt_agenda,
            hr_agendamento: fcweb[0].hr_agenda,
            dt_aprovacao: fcweb[0].dt_aprovacao,
            hr_aprovacao: fcweb[0].hr_aprovacao,
            dt_revogacao: fcweb[0].dt_revogacao,
            total: fcweb.length || 0,
            valor_cert: Construtora.valor_cert,
            modelo: fcweb[0].modelo || '',
          };
          if (solicitacaoCompleta.andamento === 'REVOGADO') {
            const dt_revogacao = new Date(solicitacaoCompleta.dt_revogacao);
            const dt_aprovacao = new Date(solicitacaoCompleta.dt_aprovacao);
            const diff = dt_revogacao.getTime() - dt_aprovacao.getTime();
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (diffDays > 6) {
              total += fcweb.length;
              Dados.push(solicitacaoCompleta);
            }
          } else {
            total += fcweb.length;
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
        
        // Monta o objeto final
        empreendimentosArray.push({
          id,
          nome: empreendimentoData[0].empreendimento.nome,
          total,
          valor: (total * Construtora.valor_cert).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
          solicitacoes: empreendimentoData,
        });
      };
     
      const table = await this.PdfCreate.createXlsx(
        Construtora,
        total,
        protocolo,
        empreendimentosArray,
      );
      
      fs.writeFileSync(
        'empreendimentos.json',
        JSON.stringify(empreendimentosArray, null, 2),
      );
      const { url, fileName } = await this.PdfCreate.GerarRelatorioPdf(
        protocolo,
        Construtora,
        modelo,
        total,
        Construtora.valor_cert,
      );

      return { protocolo, fileName, table };
    } catch (error) {
      const retorno = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  findAll() {
    return `This action returns all relatorioFinanceiro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} relatorioFinanceiro`;
  }

  update(id: number, updateRelatorioFinanceiroDto: any) {
    return `This action updates a #${id} relatorioFinanceiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} relatorioFinanceiro`;
  }

  async RelatorioFinanceiro(data: CreateRelatorioDto) {
    const { ConstrutoraId, EmpreendimentoId, Inicio, Fim, SituacaoId } = data;

    const relatorio = await this.Prisma.solicitacao.findMany({
      where: {
        construtoraId: ConstrutoraId,
        situacao_pg: SituacaoId,
        ...(EmpreendimentoId && { empreendimentoId: EmpreendimentoId }),
        ...(Fim
          ? {
              createdAt: {
                gte: new Date(Inicio),
                lte: new Date(Fim),
              },
            }
          : {
              createdAt: {
                gte: new Date(Inicio),
              },
            }),
        andamento: {
          in: ['APROVADO', 'EMITIDO', 'REVOGADO'],
        },
        dt_aprovacao: {
          not: null,
        },
      },
    });

    return relatorio;
  }

  async ListaSolicitacoes(
    ConstrutoraId: number,
    EmpreendimentoId: number,
    Inicio: string,
    Fim: string | null,
    SituacaoId: number,
  ) {
    try {
      const relatorio = await this.Prisma.solicitacao.findMany({
        where: {
          construtoraId: ConstrutoraId,
          situacao_pg: SituacaoId,
          ...(EmpreendimentoId && { empreendimentoId: EmpreendimentoId }),
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

  // async GerarRelatorioPdf(
  //   protocolo: string,
  //   construtora: Construtora,
  //   modelo: string,
  //   total: number,
  //   valor_cert: number,
  // ) {
  //   // 1. Definição das fontes (ajuste o caminho conforme a estrutura do seu projeto)
  //   const fonts = {
  //     Roboto: {
  //       normal: path.join(
  //         __dirname,
  //         '../../../assets/fonts/Roboto-Regular.ttf',
  //       ),
  //       bold: path.join(__dirname, '../../../assets/fonts/Roboto-Bold.ttf'),
  //       italics: path.join(
  //         __dirname,
  //         '../../../assets/fonts/Roboto-Italic.ttf',
  //       ),
  //       bolditalics: path.join(
  //         __dirname,
  //         '../../../assets/fonts/Roboto-BoldItalic.ttf',
  //       ),
  //     },
  //   };
  //   const printer = new PdfPrinter(fonts);

  //   // 2. Carregando a logo em base64
  //   const logoPath = path.join(__dirname, '../../../assets/logo-interface.png');
  //   const logoBase64 = fs.readFileSync(logoPath).toString('base64');

  //   // 3. Montando o conteúdo do PDF
  //   const docDefinition: TDocumentDefinitions = {
  //     content: [
  //       // Cabeçalho com logo e título
  //       {
  //         columns: [
  //           {
  //             image: `data:image/png;base64,${logoBase64}`,
  //             width: 70,
  //             margin: [0, 0, 20, 0],
  //           },
  //           [
  //             { text: 'FOLHA DE PEDIDO', style: 'header' },
  //             { text: 'Ar Interface Certificadora', style: 'subheader' },
  //             { text: 'CERTIFICADORA', style: 'certificadora' },
  //           ],
  //         ],
  //       },
  //       { text: '\n' },
  //       // Data e número do pedido
  //       {
  //         columns: [
  //           {
  //             text: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
  //             style: 'field',
  //           },
  //           {
  //             text: `Nº do Pedido: ${protocolo}`,
  //             style: 'field',
  //             alignment: 'right',
  //           },
  //         ],
  //       },
  //       {
  //         canvas: [
  //           {
  //             type: 'line',
  //             x1: 0,
  //             y1: 0,
  //             x2: 520,
  //             y2: 0,
  //             lineWidth: 1,
  //             lineColor: '#00713C',
  //           },
  //         ],
  //       },
  //       { text: '\n' },
  //       // Dados do cliente e modelo
  //       {
  //         text: `Cliente: ${construtora.fantasia || construtora.razaosocial}`,
  //         style: 'field',
  //       },
  //       { text: `Modelo: ${modelo}`, style: 'field' },
  //       { text: '\n' },
  //       // Tabela de produtos/serviços
  //       {
  //         table: {
  //           widths: ['auto', '*', 'auto', 'auto'],
  //           body: [
  //             [
  //               { text: 'CÓDIGO', style: 'tableHeader' },
  //               { text: 'PRODUTO / SERVIÇO', style: 'tableHeader' },
  //               { text: 'QTDE', style: 'tableHeader' },
  //               { text: 'VALOR UNIT.', style: 'tableHeader' },
  //             ],
  //             [
  //               protocolo,
  //               modelo,
  //               total,
  //               { text: `R$ ${valor_cert.toFixed(2)}`, alignment: 'right' },
  //             ],
  //           ],
  //         },
  //         layout: 'lightHorizontalLines',
  //       },
  //       { text: '\n' },
  //       // Totais
  //       {
  //         columns: [
  //           { width: '*', text: '' },
  //           {
  //             width: 'auto',
  //             table: {
  //               body: [
  //                 [
  //                   'SUBTOTAL',
  //                   {
  //                     text: `R$ ${(total * valor_cert).toFixed(2)}`,
  //                     alignment: 'right',
  //                   },
  //                 ],
  //                 ['DESCONTOS', { text: 'R$ 0,00', alignment: 'right' }],
  //                 [
  //                   { text: 'TOTAL GERAL', bold: true },
  //                   {
  //                     text: `R$ ${(total * valor_cert).toFixed(2)}`,
  //                     alignment: 'right',
  //                     bold: true,
  //                   },
  //                 ],
  //               ],
  //             },
  //             layout: 'noBorders',
  //           },
  //         ],
  //       },
  //     ],
  //     styles: {
  //       header: { fontSize: 18, bold: true, color: '#1D1D1B' },
  //       subheader: { fontSize: 12, bold: true, color: '#1D1D1B' },
  //       certificadora: { fontSize: 10, color: '#00713C', bold: true },
  //       field: { fontSize: 10, color: '#1D1D1B', margin: [0, 2, 0, 2] },
  //       tableHeader: {
  //         fillColor: '#00713C',
  //         color: '#fff',
  //         bold: true,
  //         fontSize: 10,
  //       },
  //     },
  //     defaultStyle: {
  //       font: 'Roboto',
  //     },
  //     pageMargins: [40, 60, 40, 60],
  //   };

  //   // 4. Gerando o PDF em buffer
  //   const pdfDoc = printer.createPdfKitDocument(docDefinition);
  //   const chunks: Buffer[] = [];
  //   pdfDoc.on('data', (chunk) => chunks.push(chunk));
  //   pdfDoc.end();

  //   // 5. Esperando o buffer ser preenchido
  //   const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
  //     pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
  //     pdfDoc.on('error', reject);
  //   });

  //   // 6. Salvando no Minio S3
  //   const fileName = `folha-pedido-${protocolo}.pdf`;
  //   const url = await this.S3.uploadFile(
  //     'relatoriofinanceiro',
  //     fileName,
  //     'application/pdf',
  //     pdfBuffer,
  //   );
  //   console.log('🚀 ~ RelatorioFinanceiroService ~ url:', url);

  //   return url;
  // }
}
