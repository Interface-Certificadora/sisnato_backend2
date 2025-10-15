import { HttpException, Injectable } from '@nestjs/common';
import { UpdateNowDto } from './dto/update-now.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorChamadoEntity } from '../chamado/entities/chamado.error.entity';
import { plainToClass } from 'class-transformer';
import { Now } from './entities/now.entity';
import { LogService } from 'src/log/log.service';

@Injectable()
export class NowService {
  constructor(
    private prismaService: PrismaService,
    private Log: LogService,
  ) {}

  async findOne(id: number) {
    try {
      const req = await this.prismaService.solicitacao.findUnique({
        where: {
          id: id,
        },
        select: {
          alertanow: true,
        },
      });
      if (!req) {
        const retorno: ErrorChamadoEntity = {
          message: 'Chamado não encontrado',
        };
        throw new HttpException(retorno, 404);
      }
      return plainToClass(Now, req);
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } 
  }

  async update(id: number, updateNowDto: UpdateNowDto, User: any) {
    try {
      const newDate = new Date();
      const req = await this.prismaService.solicitacao.update({
        where: {
          id: id,
        },
        data: {
          alertanow: updateNowDto.alertanow,
          dt_criacao_now: newDate,
          createdAt: newDate,
        },
      });
      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Now',
        Descricao: `O Usuário ${User.id}-${User.nome} Criou um Alerta Now para a solicitação com ID: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(Now, req);
    } catch (error) {
      const retorno: ErrorChamadoEntity = {
        message: error.message ? error.message : 'Erro Desconhecido',
      };
      throw new HttpException(retorno, 500);
    } 
  }
}
