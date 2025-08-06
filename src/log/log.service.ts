import { HttpException, Injectable } from '@nestjs/common';
import { ErrorEntity } from '../entities/error.entity';
import { PrismaService } from '../prisma/prisma.service';
import { GetLogsDto } from './dto/get.log.dto';
import { PostLogDto } from './dto/post.log.dto';

@Injectable()
export class LogService {
  constructor(private Prisma: PrismaService) {}

  /**
   * Returns an array of the 20 most recent logs for the given id and rota
   * @param Id - the id of the log to search for
   * @param Rota - the rota of the log to search for
   * @returns an array of LogsEntity objects
   * @throws a 400 error with a ErrorEntity if there's an error
   */
  async Get(data: GetLogsDto): Promise<string[]> {
    try {
      const req = await this.Prisma.read.logs.findMany({
        where: { EffectId: data.Id, rota: data.Rota },
        select: { descricao: true },
        take: 20,
      });
      return req.map((i: any) => i.descricao);
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  /**
   * Create a new log for the given EffectId and rota
   * @param User - the id of the user who is creating the log
   * @param EffectId - the id of the effect that is being logged
   * @param Rota - the rota of the log
   * @param Descricao - the description of the log
   * @returns an array of the 20 most recent logs for the given EffectId and rota
   * @throws a 400 error with a ErrorEntity if there's an error
   */
  async Post(data: PostLogDto): Promise<string[]> {
    try {
      await this.Prisma.write.logs.create({
        data: {
          User: data.User,
          EffectId: data.EffectId,
          rota: data.Rota,
          descricao: data.Descricao,
        },
      });

      const retorno = await this.Prisma.read.logs.findMany({
        where: { EffectId: data.EffectId, rota: data.Rota },
        select: { descricao: true },
        take: 20,
      });

      return retorno.map((i: any) => i.descricao);
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }
}
