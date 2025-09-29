


/**
 * Cria um envelope no Intelesign
 * 
 * @param empreendimentoName - Nome do empreendimento
 * @param expireDay - Dias para expiração
 * @param token - Token de autenticação
 */
export async function criaEnvelope(empreendimentoName: string, expireDay: number, token: string) {
  try {
    const url = 'https://api.intellisign.com/v1/envelopes';

    // calcular data de expiração
   const expireDate = new Date();
   expireDate.setDate(expireDate.getDate() + expireDay);

      
    const Body = {
      title: `SisNato - Assinatura de documento`,
      subject: `Contrato de financiamento de imóvel - ${empreendimentoName}`,
      message: `Por favor, assine o documento para prosseguir com o processo de financiamento de imóvel.`,
      expire_at: expireDate.toISOString(),
      action_reminder_frequency: 24,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(Body),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar envelope:', error);
    throw new Error(`Erro ao criar envelope: ${error.message}`);
    }
}
