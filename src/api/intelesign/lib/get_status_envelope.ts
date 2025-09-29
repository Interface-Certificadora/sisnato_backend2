export async function getStatusEnvelope(envelopeId: string, token: string) {
  const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}?extended=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return;
    }

    return data.state;
  } catch (error) {
    console.log('🚀 ~ getStatusEnvelope ~ error:', error);
    return;
  }
}
