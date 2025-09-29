import { UploadManifest } from "../entities/upload-manifest.entity";

export async function uploadManifesto(
  envelopeId: string,
  manifesto: Buffer,
  fileName: string,
  token: string,
): Promise<UploadManifest> {
  try {
    const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}/documents`;

    const blob = new Blob([manifesto], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, fileName);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta de erro da API:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `API retornou erro ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Erro ao upload manifesto:', error);
    throw new Error(`Erro ao upload manifesto: ${error.message}`);
  }
}
