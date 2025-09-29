import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

export async function refreshToken(): Promise<{ access_token: string }> {
  try {
    const token = await prisma.appToken.findUnique({
      where: { id: 1 },
    });

    if(token && !isTimestampExpired(Number(token.expires_in))) {
      return { access_token: token.access_token };
    }


    const Client_Id = process.env.INTELLISING_CLIENTE_ID;
    const Client_Secret = process.env.INTELLISING_CLIENTE_SECRET;
    const response = await fetch('https://api.intellisign.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: Client_Id,
        client_secret: Client_Secret,
        scope: '*',
      }),
    });

    const data = await response.json();
    console.log("🚀 ~ refreshToken ~ data:", data)
    if (data.error) {
      throw new Error(`Erro ao renovar token: ${JSON.stringify(data, null, 2)}`);
    }
    await prisma.appToken.update({
      where: { id: 1 },
      data: {
        access_token: data.access_token,
        expires_in: data.expires_in,
      },
    });
    return { access_token: data.access_token };
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    throw new Error(`Erro ao renovar token: ${JSON.stringify(error.message, null, 2)}`);
  }
}


 function isTimestampExpired(timestamp: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now > timestamp;
  }
