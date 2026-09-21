import { gerarDiretoLinkToken, lerDiretoLinkToken } from './direto-link-token';

describe('direto-link-token', () => {
  const payload = {
    solicitacaoId: 123,
    cpf: '123.456.789-00',
    cobrancaId: 'TX123ABC',
  };

  beforeEach(() => {
    process.env.DIRETO_LINK_SECRET = 'segredo-de-teste-com-mais-de-16';
  });

  it('gera e lê o mesmo payload (CPF só com dígitos)', () => {
    const token = gerarDiretoLinkToken(payload);
    expect(lerDiretoLinkToken(token)).toEqual({
      ...payload,
      cpf: '12345678900',
    });
  });

  it('token é url-safe e não expõe os dados', () => {
    const token = gerarDiretoLinkToken(payload);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toContain('12345678900');
  });

  it('tokens diferentes a cada geração', () => {
    expect(gerarDiretoLinkToken(payload)).not.toBe(
      gerarDiretoLinkToken(payload),
    );
  });

  it('rejeita token adulterado', () => {
    const token = gerarDiretoLinkToken(payload);
    const adulterado =
      token.slice(0, -2) + (token.endsWith('AA') ? 'BB' : 'AA');
    expect(() => lerDiretoLinkToken(adulterado)).toThrow();
  });

  it('rejeita lixo e token de outra chave', () => {
    expect(() => lerDiretoLinkToken('abc')).toThrow();
    const token = gerarDiretoLinkToken(payload);
    process.env.DIRETO_LINK_SECRET = 'outra-chave-totalmente-diferente';
    expect(() => lerDiretoLinkToken(token)).toThrow();
  });
});
