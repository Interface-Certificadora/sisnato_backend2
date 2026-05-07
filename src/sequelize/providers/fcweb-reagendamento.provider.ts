import { Injectable } from '@nestjs/common';
import { FcwebReagendamento } from '../models/fcweb-reagendamento.model';
import { Op } from 'sequelize';

@Injectable()
export class FcwebReagendamentoProvider {
  // Busca quantos reagendamentos existem para uma lista de IDs de solicitações NATO
  async countByFcwebIds(ids: number[]): Promise<number> {
    if (!ids.length) return 0;

    return FcwebReagendamento.count({
      where: {
        id_fcweb: {
          [Op.in]: ids,
        },
      },
    });
  }

  // Busca a lista detalhada caso queira mostrar no dashboard quem reagendou
  async findByFcwebIds(ids: number[]): Promise<FcwebReagendamento[]> {
    if (!ids.length) return [];

    return FcwebReagendamento.findAll({
      where: {
        id_fcweb: {
          [Op.in]: ids,
        },
      },
      raw: true,
    });
  }
}
