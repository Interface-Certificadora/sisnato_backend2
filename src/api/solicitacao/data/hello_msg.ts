export default function helloMsg(
  nome: string,
  construtora: string,
  cidade: string,
  financeira: string,
) {
  return `Ola *${nome}*, tudo bem?!\n\nSomos a *Interface Certificadora*, e à pedido da construtora ${construtora} estamos entrando em contato referente ao seu novo empreendimento${cidade ? `, em *${cidade}*` : ''}.\nPrecisamos fazer o seu certificado digital para que você possa assinar os documentos do seu financiamento imobiliário junto a CAIXA e Correspondente bancário ${financeira}, e assim prosseguir para a próxima etapa.\n\nPara mais informações, responda essa mensagem, ou aguarde segundo contato.`;
}
