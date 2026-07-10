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

  /**
   * Cria um novo registro de agendamento diretamente no banco via query nativa
   */
  async create(data: {
    fcweb_id: number;
    agente_id: number;
    data_agendada: string;
    hora_agendada: string;
    modalidade: string;
  }): Promise<any> {
    const query = `
      INSERT INTO agendamentos (
        id_fcweb,          -- Nome exato da linha 2 do seu DBeaver
        data_agendada, 
        hora_agendada, 
        modalidade,
        agente_id
      ) VALUES (
        :fcweb_id, 
        :data_agendada, 
        :hora_agendada, 
        :modalidade,
        :agente_id
      );
    `;

    const instance = this.sequelizeWrapper.getInstance();
    if (!instance) throw new Error('Conexão com o MySQL indisponível.');

    return instance.query(query, {
      replacements: {
        fcweb_id: data.fcweb_id,
        data_agendada: data.data_agendada,
        hora_agendada: data.hora_agendada,
        modalidade: data.modalidade,
        agente_id: data.agente_id,
      },
      type: QueryTypes.INSERT,
    });
  }
}
