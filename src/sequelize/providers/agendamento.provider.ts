import { Injectable } from '@nestjs/common';
import { Sequelize } from '../sequelize';
import { QueryTypes } from 'sequelize';

@Injectable()
export class AgendamentoProvider {
  constructor(private readonly sequelizeWrapper: Sequelize) {}

  async buscarHorariosOcupados(
    dataAlvo: string,
    modalidadeAlvo: string,
  ): Promise<any[]> {
    const query = `
      SELECT 
        agente_id,
        TIME_FORMAT(hora_agendada, '%H:%i') AS hora_agendada
      FROM agendamentos
      WHERE data_agendada = :dataAlvo
        AND modalidade = :modalidadeAlvo;
    `;

    const instance = this.sequelizeWrapper.getInstance();
    if (!instance) throw new Error('Conexão com o MySQL indisponível.');

    return instance.query(query, {
      replacements: { dataAlvo, modalidadeAlvo },
      type: QueryTypes.SELECT,
      raw: true,
    });
  }
}
