import { createHash, randomBytes } from 'node:crypto';
import { Request } from 'express';

export const CHAT_BUCKET = 'chat';
export const CHAT_TOKEN_HEADER = 'x-chat-token';
export const CHAT_MIDIA_MAX_BYTES = 16 * 1024 * 1024;

const DIA_MS = 24 * 60 * 60 * 1000;
export const CHAT_TOKEN_VALIDADE_MS = {
  verificado: 90 * DIA_MS,
  naoVerificado: 30 * DIA_MS,
};

export const somenteDigitos = (v?: string | null) =>
  (v || '').replace(/\D/g, '');

/**
 * Normaliza o telefone para DDD + número (10 ou 11 dígitos), sem o 55.
 * Retorna null se não parecer um telefone brasileiro válido.
 */
export function telefoneLocal(v?: string | null): string | null {
  let d = somenteDigitos(v);
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) {
    d = d.slice(2);
  }
  return d.length === 10 || d.length === 11 ? d : null;
}

export function cpfValido(v?: string | null): string | null {
  const d = somenteDigitos(v);
  return d.length === 11 ? d : null;
}

export function cpfComMascara(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function gerarToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function ipDaRequisicao(req: Request): string | null {
  // A API só escuta em 127.0.0.1 atrás do nginx, então o header é confiável
  const encaminhado = req.headers['x-forwarded-for'];
  const ip = Array.isArray(encaminhado)
    ? encaminhado[0]
    : encaminhado?.split(',')[0];
  return (ip || req.ip || '').trim().slice(0, 45) || null;
}

/**
 * Limite simples em memória (a API roda em um único container).
 * Conta só as falhas; um acerto não zera, para não ajudar quem está chutando.
 */
export class LimiteTentativas {
  private registros = new Map<string, { falhas: number; expiraEm: number }>();

  constructor(
    private readonly maxFalhas: number,
    private readonly janelaMs: number,
  ) {}

  bloqueado(chave: string): boolean {
    const r = this.registros.get(chave);
    if (!r) return false;
    if (r.expiraEm < Date.now()) {
      this.registros.delete(chave);
      return false;
    }
    return r.falhas >= this.maxFalhas;
  }

  registrarFalha(chave: string) {
    const agora = Date.now();
    const r = this.registros.get(chave);
    if (!r || r.expiraEm < agora) {
      this.registros.set(chave, { falhas: 1, expiraEm: agora + this.janelaMs });
    } else {
      r.falhas++;
    }
    if (this.registros.size > 10000) this.limpar();
  }

  private limpar() {
    const agora = Date.now();
    for (const [k, r] of this.registros) {
      if (r.expiraEm < agora) this.registros.delete(k);
    }
  }
}
