import { HttpException } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

export interface DiretoLinkPayload {
  solicitacaoId: number;
  cpf: string;
  cobrancaId: string;
}

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.DIRETO_LINK_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'DIRETO_LINK_SECRET não configurada (mínimo 16 caracteres)',
    );
  }
  return createHash('sha256').update(secret).digest();
}

/** Gera token único, url-safe e ilegível (AES-256-GCM). */
export function gerarDiretoLinkToken(payload: DiretoLinkPayload): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const json = JSON.stringify({
    s: payload.solicitacaoId,
    p: payload.cpf.replace(/\D/g, ''),
    c: payload.cobrancaId,
  });
  const encrypted = Buffer.concat([
    cipher.update(json, 'utf8'),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    'base64url',
  );
}

/** Lê o token; qualquer adulteração ou formato inválido resulta em 400. */
export function lerDiretoLinkToken(token: string): DiretoLinkPayload {
  try {
    const raw = Buffer.from(token, 'base64url');
    if (raw.length <= IV_LENGTH + TAG_LENGTH) throw new Error('curto');
    const iv = raw.subarray(0, IV_LENGTH);
    const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const data = raw.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(data), decipher.final()]);
    const { s, p, c } = JSON.parse(json.toString('utf8'));
    if (
      !Number.isInteger(s) ||
      typeof p !== 'string' ||
      typeof c !== 'string'
    ) {
      throw new Error('payload');
    }
    return { solicitacaoId: s, cpf: p, cobrancaId: c };
  } catch {
    throw new HttpException('Link inválido ou expirado.', 400);
  }
}
