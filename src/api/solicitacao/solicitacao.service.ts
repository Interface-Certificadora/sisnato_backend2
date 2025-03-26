import { HttpException, Injectable } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { ErrorEntity } from 'src/entities/error.entity';

@Injectable()
export class SolicitacaoService {
  create(createSolicitacaoDto: CreateSolicitacaoDto) {
    return 'This action adds a new solicitacao';
  }

  async findAll(pagina: number, limite: number, filtro: any, UserData: any) {
    try {
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitacao`;
  }

  update(id: number, updateSolicitacaoDto: UpdateSolicitacaoDto) {
    return `This action updates a #${id} solicitacao`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitacao`;
  }
}
