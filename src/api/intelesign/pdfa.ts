import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Perfil sRGB padrão (IEC 61966-2.1) usado como OutputIntent do PDF/A
const ICC_PATH = path.resolve(
  process.cwd(),
  'src/api/intelesign/public/sRGB_IEC61966_2_1.icc',
);

/**
 * Converte um PDF para PDF/A-2b com o Ghostscript.
 *
 * Cartórios só aceitam documento nato-digital em PDF/A (Prov. CNJ 149/2023,
 * art. 208). A conversão precisa rodar ANTES das assinaturas: o Ghostscript
 * reescreve o arquivo inteiro, o que invalidaria qualquer assinatura existente.
 */
export async function converterParaPdfA(
  pdf: Buffer,
): Promise<Buffer<ArrayBuffer>> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfa-'));
  const entrada = path.join(dir, 'entrada.pdf');
  const saida = path.join(dir, 'saida.pdf');
  const definicao = path.join(dir, 'PDFA_def.ps');

  try {
    await fs.writeFile(entrada, pdf);
    // OutputIntent obrigatório no PDF/A, apontando para o perfil sRGB
    await fs.writeFile(
      definicao,
      `%!
[/_objdef {icc_PDFA} /type /stream /OBJ pdfmark
[{icc_PDFA} << /N 3 >> /PUT pdfmark
[{icc_PDFA} (${ICC_PATH}) (r) file /PUT pdfmark
[/_objdef {OutputIntent_PDFA} /type /dict /OBJ pdfmark
[{OutputIntent_PDFA} <<
  /Type /OutputIntent
  /S /GTS_PDFA1
  /DestOutputProfile {icc_PDFA}
  /OutputConditionIdentifier (sRGB IEC61966-2.1)
>> /PUT pdfmark
[{Catalog} << /OutputIntents [ {OutputIntent_PDFA} ] >> /PUT pdfmark
`,
    );

    await execFileAsync(
      'gs',
      [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        `--permit-file-read=${ICC_PATH}`,
        '-sDEVICE=pdfwrite',
        '-dPDFA=2',
        // 1 = remove o que não pode ser PDF/A e segue gerando PDF/A
        '-dPDFACompatibilityPolicy=1',
        '-sColorConversionStrategy=RGB',
        '-dEmbedAllFonts=true',
        '-dAutoRotatePages=/None',
        `-sOutputFile=${saida}`,
        definicao,
        entrada,
      ],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
    );

    return Buffer.from(await fs.readFile(saida));
  } catch (error) {
    const detalhe = error?.stderr || error?.message || error;
    console.error('[converterParaPdfA] Falha no Ghostscript:', detalhe);
    throw new Error('Não foi possível converter o documento para PDF/A');
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
