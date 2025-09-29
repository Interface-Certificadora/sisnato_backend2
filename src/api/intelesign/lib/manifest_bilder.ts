import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import QRCode from 'qrcode';
import fontkit from '@pdf-lib/fontkit';

// Tipos de dados
interface Signatario {
  nome: string;
  cpf: string;
  email: string;
}

interface DadosManifesto {
  codigoValidacao: string;
  signatarios: Signatario[];
  urlVerificacao: string;
  logoPath?: string;
}

// Constantes de layout
const LAYOUT = {
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
    YELLOW: rgb(1, 1, 0.4)
  },
  
  // Tamanhos de fonte
  FONT_SIZES: {
    TITLE: 20,
    SUBTITLE: 10,
    NORMAL: 12,
    SMALL: 10
  },
  
  // Tamanhos de elementos
  ELEMENTS: {
    QR_CODE_SIZE: 90,
    CHECKBOX_SIZE: 16,
    LINE_HEIGHT: 18,
    SPACING: 20,
    SMALL_SPACING: 10
  }
};

/**
 * Gera um manifesto PDF com as informações de assinatura digital
 */
export async function buildManifest(
  fileBuffer: Buffer,
  data: DadosManifesto,
): Promise<Buffer> {
  try {
    // 1. Configuração inicial do documento
    const pdfDoc = await PDFDocument.load(fileBuffer);
    pdfDoc.registerFontkit(fontkit);

    // 2. Configuração da página
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // 3. Carregamento de fontes
    const { robotoRegular, robotoBold } = await loadFonts(pdfDoc);
    
    // 4. Função auxiliar para desenhar texto
    const drawText = createTextDrawer(page, robotoRegular, robotoBold);
    
    // 5. Posicionamento inicial
    let yPosition = height - LAYOUT.MARGIN_TOP;
    
    // 6. Geração do QR Code
    const qrCodeImage = await generateQRCode(pdfDoc, data);
    
    // 7. Desenha o cabeçalho com logo e QR Code
    yPosition = await drawHeader(page, drawText, qrCodeImage, data, yPosition, width, robotoRegular, robotoBold, pdfDoc);
    
    // 8. Desenha o código de validação
    yPosition = drawValidationCode(page, drawText, data.codigoValidacao, yPosition, width, robotoRegular, robotoBold);
    
    // 9. Desenha a lista de signatários
    yPosition = drawSignatories(page, drawText, data.signatarios || [], yPosition);
    
    // 10. Desenha as instruções de verificação
    drawVerificationInstructions(page, drawText, data, yPosition, robotoRegular);

    // 11. Salva e retorna o PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Erro ao gerar o manifesto:', error);
    throw new Error('Falha ao gerar o manifesto PDF: ' + error.message);
  }
}

/**
 * Carrega as fontes Roboto necessárias
 */
async function loadFonts(pdfDoc: PDFDocument) {
  try {
    const fontsPath = path.join(process.cwd(), 'src/pdf_create/assets/fonts');
    
    const [robotoRegular, robotoBold] = await Promise.all([
      pdfDoc.embedFont(await fs.promises.readFile(path.join(fontsPath, 'Roboto-Regular.ttf'))),
      pdfDoc.embedFont(await fs.promises.readFile(path.join(fontsPath, 'Roboto-Bold.ttf')))
    ]);
    
    return { robotoRegular, robotoBold };
  } catch (error) {
    console.error('Erro ao carregar fontes Roboto:', error);
    throw new Error('Não foi possível carregar as fontes Roboto necessárias');
  }
}

/**
 * Cria uma função auxiliar para desenhar texto com tratamento de erros
 */
function createTextDrawer(
  page: any, 
  regularFont: any, 
  boldFont: any
) {
  return (
    text: string, 
    x: number, 
    y: number, 
    size: number, 
    options: { bold?: boolean; color?: any; maxWidth?: number } = {}
  ) => {
    if (!text) return;
    
    const { bold = false, color = LAYOUT.COLORS.BLACK, maxWidth } = options;
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

/**
 * Gera o QR Code a partir dos dados fornecidos
 */
async function generateQRCode(
  pdfDoc: PDFDocument, 
  data: DadosManifesto
) {
  try {
    const urlVerificacao = data.urlVerificacao || '';
    const codigoValidacao = data.codigoValidacao || 'N/A';
    
    const qrCodeDataUrl = await QRCode.toDataURL(
      `${urlVerificacao}${codigoValidacao}`,
      { width: 300, margin: 1 } // Maior resolução para melhor qualidade
    );
    
    const qrCodeBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    return await pdfDoc.embedPng(qrCodeBytes);
    
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar o QR Code');
  }
}

/**
 * Desenha o cabeçalho com logo e QR Code
 */
async function drawHeader(
  page: any,
  drawText: Function,
  qrCodeImage: any,
  data: DadosManifesto,
  yPosition: number,
  pageWidth: number,
  robotoRegular: any,
  robotoBold: any,
  pdfDoc: any
) {
  const { MARGIN, ELEMENTS, COLORS, FONT_SIZES } = LAYOUT;
  const headerTop = yPosition;
  const qrCodeSize = ELEMENTS.QR_CODE_SIZE;
  
  try {
    // 1. Desenha o logo à esquerda
    const logoPath = data.logoPath || path.resolve(
      process.cwd(),
      'src/api/intelesign/lib/public/Logo_Sisnato_013.png'
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
    drawText('LOGO NÃO CARREGADO', MARGIN, headerTop - 20, 10, { color: COLORS.BLACK, bold: true });
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
  
  title.split('\n').forEach(line => {
    const textWidth = titleFont.widthOfTextAtSize(line, FONT_SIZES.TITLE);
    drawText(
      line,
      (pageWidth - textWidth) / 2,
      currentY,
      FONT_SIZES.TITLE,
      { bold: true }
    );
    currentY -= FONT_SIZES.TITLE + 5;
  });
  
  // 4. Subtítulo
  const subtitle = 'Documento assinado digitalmente com validade jurídica';
  const subtitleFont = robotoRegular;
  const subtitleWidth = subtitleFont.widthOfTextAtSize(subtitle, FONT_SIZES.SUBTITLE);
  
  drawText(
    subtitle,
    (pageWidth - subtitleWidth) / 2,
    currentY - 15,
    FONT_SIZES.SUBTITLE,
    { color: COLORS.GRAY }
  );
  
  return currentY - 50; // Retorna a nova posição Y
}

/**
 * Desenha o código de validação
 */
function drawValidationCode(
  page: any,
  drawText: Function,
  codigoValidacao: string,
  yPosition: number,
  pageWidth: number,
  robotoRegular: any,
  robotoBold: any
) {
  const { MARGIN, COLORS, FONT_SIZES } = LAYOUT;
  
  // Texto do código
  const label = 'Código de validação: ';
  const labelWidth = robotoRegular.widthOfTextAtSize(label, FONT_SIZES.NORMAL);
  const codeWidth = robotoBold.widthOfTextAtSize(codigoValidacao, FONT_SIZES.NORMAL);
  
  const startX = (pageWidth - (labelWidth + codeWidth)) / 2;
  
  // Desenha o texto do label
  drawText(label, startX, yPosition, FONT_SIZES.NORMAL, { color: COLORS.LIGHT_GRAY });
  
  // Desenha o fundo amarelo para o código
  const codeX = startX + labelWidth;
  const padding = 4;
  
  page.drawRectangle({
    x: codeX - padding/2,
    y: yPosition - 4,
    width: codeWidth + padding,
    height: 18,
    color: COLORS.YELLOW,
    borderColor: COLORS.BLACK,
    borderWidth: 0.5,
  });
  
  // Desenha o código em negrito
  drawText(codigoValidacao, codeX, yPosition, FONT_SIZES.NORMAL, { bold: true });
  
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

/**
 * Desenha a lista de signatários
 */
function drawSignatories(
  page: any,
  drawText: Function,
  signatarios: Signatario[],
  yPosition: number
) {
  const { MARGIN, COLORS, FONT_SIZES, ELEMENTS } = LAYOUT;
  
  // Texto explicativo
  const textoExplicativo = 'Documento assinado digitalmente com o uso de Certificado Digital ICP Brasil, o assinador IntelliSign, pelos seguintes signatários:';
  
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
  lines.forEach(line => {
    drawText(line, MARGIN, yPosition, FONT_SIZES.NORMAL);
    yPosition -= ELEMENTS.LINE_HEIGHT;
  });
  
  yPosition -= 10;
  
  // Desenha a lista de signatários
  signatarios.forEach(signatario => {
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
    const cpf = signatario.cpf ? formatCPF(signatario.cpf) : 'CPF não informado';
    const signatarioTexto = `${nome} - ${cpf}`;
    
    drawText(
      signatarioTexto,
      MARGIN + ELEMENTS.CHECKBOX_SIZE + 10,
      yPosition,
      FONT_SIZES.NORMAL
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

/**
 * Desenha as instruções de verificação
 */
function drawVerificationInstructions(
  page: any,
  drawText: Function,
  data: DadosManifesto,
  yPosition: number,
  font: any
) {
  const { MARGIN, COLORS, FONT_SIZES } = LAYOUT;
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
    const lineY = yPosition - (index * (FONT_SIZES.NORMAL + 5));
    const lineX = index === 0 ? MARGIN + textWidth : MARGIN + 20; // Indenta as linhas seguintes mais à esquerda
    
    // Desenha o texto do link em azul
    drawText(
      line,
      lineX,
      lineY,
      FONT_SIZES.NORMAL,
      { 
        color: COLORS.BLUE,
        underline: true 
      }
    );
    
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
            URI: line.startsWith('http') ? line : `http://${line}`
          }
        })
      });
    } catch (error) {
      console.warn('Erro ao adicionar link clicável:', error);
    }
  });
  
  // Ajusta a posição Y baseado no número de linhas da URL
  yPosition -= (urlLines.length * (FONT_SIZES.NORMAL + 5)) + 15;
  
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
    const lineY = yPosition - (index * (FONT_SIZES.NORMAL + 5));
    const lineX = index === 0 ? MARGIN + labelWidth : MARGIN + 20; // Indenta as linhas seguintes mais à esquerda
    
    // Desenha o texto do link em azul
    drawText(
      line,
      lineX,
      lineY,
      FONT_SIZES.NORMAL,
      { 
        color: COLORS.BLUE,
        underline: true 
      }
    );
    
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
            URI: line.startsWith('http') ? line : `http://${line}`
          }
        })
      });
    } catch (error) {
      console.warn('Erro ao adicionar link clicável:', error);
    }
  });
  
  // Ajusta a posição Y baseado no número de linhas do link direto
  yPosition -= (linkLines.length * (FONT_SIZES.NORMAL + 5)) + 15;
}

/**
 * Formata um CPF para exibição
 */
function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Formata como 000.000.000-00
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
