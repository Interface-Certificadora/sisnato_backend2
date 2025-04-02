import { HttpException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Checktel } from './entities/checktel.entity';

@Injectable()
export class ChecktelService {
  async getTell(tell: string): Promise<Checktel> {
    try {
      const req = await fetch(
        `${process.env.WHATSAPP_URL}/wa-number-check/55${tell}`,
        {
          headers: {
            'access-token': process.env.WHATSAPP_KEY,
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      );
      const verify = await req.json();
      if (verify.status !== 'INVALID_WA_NUMBER') {
        const exists: Checktel = {
          exists: true,
        };
        return plainToClass(Checktel, exists);
      }
      const exists: Checktel = {
        exists: false,
      };
      return plainToClass(Checktel, exists);
    } catch (error) {
      console.log(error);
      const retorno = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 500);
    }
  }
}
