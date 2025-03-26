import { Injectable } from '@nestjs/common';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';

@Injectable()
export class SolicitacaoService {
  create(createSolicitacaoDto: CreateSolicitacaoDto) {
    return 'This action adds a new solicitacao';
  }

  findAll() {
    return `This action returns all solicitacao`;
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
