import { Injectable } from '@nestjs/common';
import { Construtora } from '@prisma/client';
import path from 'path';
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { S3Service } from 'src/s3/s3.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PdfCreateService {
  constructor(private readonly S3: S3Service) {}

  async GerarRelatorioPdf(
    protocolo: string,
    construtora: Construtora,
    modelo: string,
    total: number,
    valor_cert: number,
    valorTotal: any,
  ) {
    // 1. Definição das fontes (ajuste o caminho conforme a estrutura do seu projeto)
    const fonts = {
      Roboto: {
        normal: path.join(
          process.cwd(),
          'src/pdf_create/assets/fonts/Roboto-Regular.ttf',
        ),
        bold: path.join(
          process.cwd(),
          'src/pdf_create/assets/fonts/Roboto-Bold.ttf',
        ),
        italics: path.join(
          process.cwd(),
          'src/pdf_create/assets/fonts/Roboto-Italic.ttf',
        ),
        bolditalics: path.join(
          process.cwd(),
          'src/pdf_create/assets/fonts/Roboto-BoldItalic.ttf',
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    // 2. Carregando a logo em base64
    const logoPath = path.join(
      process.cwd(),
      'src/pdf_create/assets/logo-interface.png',
    );
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');

    // 3. Montando o conteúdo do PDF
    const docDefinition: TDocumentDefinitions = {
      content: [
        // Cabeçalho com logo e título
        {
          columns: [
            {
              image: `data:image/png;base64,${logoBase64}`,
              width: 70,
              margin: [0, 0, 20, 0],
            },
            [
              { text: 'FOLHA DE PEDIDO', style: 'header' },
              { text: 'Ar Interface Certificadora', style: 'subheader' },
              { text: 'Tel: (16) 3325-4134', style: 'certificadora' },
              {
                text: 'E-mail: contato@arinterface.com.br',
                style: 'certificadora',
              },
              { text: 'Site: arinterface.com.br', style: 'certificadora' },
            ],
          ],
        },
        { text: '\n' },
        { text: '\n' },
        // Data e número do pedido
        {
          columns: [
            {
              text: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
              style: 'field',
            },
            {
              text: `Nº do Pedido: ${protocolo}`,
              style: 'field',
              alignment: 'right',
            },
          ],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 520,
              y2: 0,
              lineWidth: 1,
              lineColor: '#00713C',
            },
          ],
        },
        { text: '\n' },
        // Dados do cliente e modelo
        {
          text: `Cliente: ${construtora.fantasia || construtora.razaosocial}`,
          style: 'field',
        },
        {
          text: `CNPJ: ${construtora.cnpj}`,
          style: 'field',
        },
        {
          text: `E-mail: ${construtora.email || ''}`,
          style: 'field',
        },
        { text: '\n' },
        // Tabela de produtos/serviços
        {
          table: {
            widths: ['auto', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'PRODUTO / SERVIÇO', style: 'tableHeader' },
                { text: 'QTDE', style: 'tableHeader' },
                { text: 'VALOR UNIT.', style: 'tableHeader' },
              ],
              [
                { text: protocolo, style: 'fieldTable' },
                { text: modelo, style: 'fieldTable' },
                { text: total.toString(), style: 'fieldTable' },
                { text: `R$ ${valor_cert.toFixed(2)}`, style: 'fieldTable' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        // Totais
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              //posicionar na parte da inferior do documento fixo
              absolutePosition: { x: 400, y: 700 },
              table: {
                body: [
                  [
                    'SUBTOTAL',
                    {
                      text: `R$ ${valorTotal}`,
                      alignment: 'right',
                    },
                  ],
                  ['DESCONTOS', { text: 'R$ 0,00', alignment: 'right' }],
                  [
                    { text: 'TOTAL GERAL', bold: true },
                    {
                      text: `R$ ${valorTotal}`,
                      alignment: 'right',
                      bold: true,
                    },
                  ],
                ],
              },
              layout: 'noBorders',
            },
          ],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#1D1D1B',
          margin: [100, 0, 0, 0],
        },
        subheader: {
          fontSize: 12,
          bold: true,
          color: '#1D1D1B',
          alignment: 'right',
        },
        certificadora: {
          fontSize: 10,
          color: '#00713C',
          bold: true,
          alignment: 'right',
        },
        field: { fontSize: 10, color: '#1D1D1B', margin: [0, 2, 0, 2] },
        fieldTable: {
          fontSize: 9,
          color: '#1D1D1B',
          alignment: 'center',
          margin: [0, 2, 0, 2],
        },
        tableHeader: {
          fillColor: '#00713C',
          color: '#fff',
          bold: true,
          fontSize: 10,
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
      pageMargins: [40, 60, 40, 60],
    };

    // 4. Gerando o PDF em buffer
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.end();

    // 5. Esperando o buffer ser preenchido
    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
    });

    // 6. Salvando no Minio S3
    const fileName = `folha-pedido-${protocolo}.pdf`;
    const url = await this.S3.uploadFile(
      'relatoriofinanceiro',
      fileName,
      'application/pdf',
      pdfBuffer,
    );

    return { url, fileName };
  }

  async createXlsx(
    construtora: Construtora,
    valor_cert: number,
    valorTotal: any,
    total_cert: number,
    protocolo: string,
    empreendimentos: Array<{
      nome: string;
      total: number;
      valor: string;
      cidade: string;
      solicitacoes: Array<{
        id: number;
        nome: string;
        andamento: string;
        dt_aprovacao: string;
        validacao: string;
        valor_cert: number;
        valor_total_cert: number;
        tipocd: string;
        total: number;
        financeiro: {
          fantasia: string;
          id: number;
        };
        corretor: {
          id: number;
          nome: string;
          telefone: string;
        };
      }>;
    }>,
  ) {
    // Cria o workbook e worksheet normalmente
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    // Estilos globais
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 13 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF005689' },
      },
    };
    const subHeaderStyle = {
      font: {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        alignment: { horizontal: 'center' },
      },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF008080' },
      },
    };
    const tableHeaderStyle = {
      font: { bold: true, color: { argb: 'FF333333' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB2EBF2' },
      },
    };

    // 1. Cabeçalho da construtora
    worksheet.addRow([
      'Nome Construtora:',
      construtora.fantasia || construtora.razaosocial,
    ]);
    //formatar o cnpj
    worksheet.addRow([
      'CNPJ Construtora:',
      construtora.cnpj
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
    ]);
    worksheet.addRow(['Valor do Certificado:', `R$ ${valor_cert.toFixed(2)}`]);
    worksheet.addRow([
      'Valor Total a ser Pago:',
      `R$ ${valorTotal.toFixed(2)}`,
    ]);
    worksheet.addRow(['Total Certificado:', `${total_cert} und.`]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    // 3. Empreendimentos e solicitações
    for (const emp of empreendimentos) {
      // 2. Cabeçalho dos empreendimentos
      const headerRow = worksheet.addRow([
        'Nome do Empreendimento',
        'Cidade',
        'Total',
        'Valor',
        '',
      ]);
      headerRow.eachCell((cell) => {
        Object.assign(cell, headerStyle);
        cell.alignment = { horizontal: 'center' };
      });
      // Linha do empreendimento (com célula vazia no final para alinhar com o cabeçalho)
      const empRow = worksheet.addRow([
        emp?.nome ?? '',
        emp?.cidade ?? '',
        `${emp?.total ?? 0} und.`,
        emp?.valor ?? '',
        '',
      ]);
      empRow.eachCell((cell) => {
        Object.assign(cell, subHeaderStyle);
        cell.alignment = { horizontal: 'center' };
      });

      // Cabeçalho das solicitações
      const solicitacaoHeaderRow = worksheet.addRow([
        'x',
        'Id',
        'Nome',
        'DtAprovacao',
        'CCA',
        'Solicitante',
        'Certificado',
        'Validação',
        'qtd',
        'Valor',
      ]);
      solicitacaoHeaderRow.eachCell((cell) =>
        Object.assign(cell, tableHeaderStyle),
      );

      let x = 1;
      // Filtra solicitações nulas ou undefined
      const solicitacoesValidas = (emp?.solicitacoes || []).filter(s => s);
      for (const solicitacao of solicitacoesValidas) {
        worksheet.addRow([
          x++,
          solicitacao?.id ?? '',
          solicitacao?.nome ?? '',
          solicitacao?.dt_aprovacao
            ? solicitacao.dt_aprovacao.toString().split('T')[0].split('-').reverse().join('-')
            : '',
          solicitacao?.financeiro?.fantasia ?? '',
          solicitacao?.corretor?.nome ?? '',
          solicitacao?.validacao ?? '',
          solicitacao?.total ?? '',
          `R$ ${solicitacao?.valor_total_cert ?? 0}`,
        ]);
      }
      worksheet.addRow([]); // Linha em branco entre empreendimentos
      worksheet.addRow([]); // Linha em branco entre empreendimentos
    }

    // Ajuste automático de largura das colunas
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });

    // Gera o arquivo em buffer (não salva localmente)
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer); // Corrige o tipo para Buffer do Node.js

    // Define nome do arquivo com protocolo
    const fileName = `relatorio-${protocolo}.xlsx`;

    // Salva no S3 usando o serviço já existente
    await this.S3.uploadFile(
      'relatoriofinanceiro', // bucket ou pasta no S3
      fileName,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    );

    // Retorna o nome do arquivo salvo no S3
    return fileName;
  }
}
