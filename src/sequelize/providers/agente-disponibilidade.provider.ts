import { Injectable } from '@nestjs/common';
import { Sequelize } from '../sequelize';
import { QueryTypes } from 'sequelize';

@Injectable()
export class AgenteDisponibilidadeProvider {
  constructor(private readonly sequelizeWrapper: Sequelize) {}

  async buscarGradeDisponivel(
    diaSemana: string,
    modalidadeAlvo: string,
  ): Promise<any[]> {
    const query = `
      SELECT 
        a.id AS agente_id,
        a.nome AS agente_nome,
        TIME_FORMAT(ad.hora, '%H:%i') AS hora
      FROM agente_disponibilidade ad
      INNER JOIN agentes a ON a.id = ad.agente_id
      INNER JOIN agente_modalidade am ON am.agente_id = a.id
      WHERE a.ativo = 1
        AND am.modalidade = :modalidadeAlvo
        AND ad.dia_semana = :diaSemana
        AND ad.disponivel = 1;
    `;

    const instance = this.sequelizeWrapper.getInstance();
    if (!instance) throw new Error('Conexão com o MySQL indisponível.');

    return instance.query(query, {
      replacements: { diaSemana, modalidadeAlvo },
      type: QueryTypes.SELECT,
      raw: true,
    });
  }
}
