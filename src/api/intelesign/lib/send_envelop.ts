

export async function sendEnvelop(envelopeId: string, token: string) {
  const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}/send`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("🚀 ~ sendEnvelop ~ data:", data)

    if (!response.ok) {
      throw new Error(`Erro ao enviar envelope: ${data.message || response.statusText}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Erro ao enviar envelope: ${error.message}`);
  }
}