import { Injectable } from '@nestjs/common';
import { Fcweb } from '../models/fcweb.model';
import { Sequelize } from '../sequelize';
import { Op } from 'sequelize';

@Injectable()
export class FcwebProvider {
  constructor(private sequelize: Sequelize) {}

  async findById(id: number): Promise<Fcweb> {
    return Fcweb.findByPk(id);
  }

  async findByIdMin(id: number): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
  }> {
    const req = await Fcweb.findByPk(id, {
      attributes: [
        'id',
        'andamento',
        'dt_agenda',
        'hr_agenda',
        'dt_aprovacao',
        'hr_aprovacao',
      ],
    });

    return req.dataValues;
  }

  async findAll(options?: any): Promise<Fcweb[]> {
    return Fcweb.findAll(options);
  }

  async findByCpf(cpf: string): Promise<Fcweb[]> {
    return Fcweb.findAll({
      where: {
        cpf: cpf,
      },
    });
  }

  /**
   * @name findAllCpfMin
   * @description Busca todas as solicitações de um cpf, com retorno de parâmetros mínimos
   * @param cpf
   * @returns {id: number; andamento: string; dt_agenda: Date; hr_agenda: string; dt_aprovacao: Date; hr_aprovacao: string; dt_revogacao: Date; modelo: string; valor_cert: number; formapgto: string; validacao: string; tipocd: string }[]}
   *
   */
  async findAllCpfMin(
    cpf: string,
  ): Promise<
    {
      id: number;
      andamento: string;
      dt_agenda: Date;
      hr_agenda: string;
      dt_aprovacao: Date;
      hr_aprovacao: string;
      dt_revogacao: Date;
      modelo: string;
      valor_cert: number;
      formapgto: string;
      validacao: string;
      tipocd: string;
    }[]
  > {
    const req = await Fcweb.findAll({
      attributes: [
        'id',
        'andamento',
        'dt_agenda',
        'hr_agenda',
        'dt_aprovacao',
        'hr_aprovacao',
        'dt_revogacao',
        'tipocd',
        'formapgto',
        'valorcd',
        'validacao',
      ],
      where: {
        cpf: cpf,
      },
    });

    const data = req.map((item) => {
      const value = item.dataValues;
      const modelo =
        value.tipocd === 'A3PF'
          ? 'Certificado Pessoa Física Modelo A3 valido por 3 anos'
          : value.tipocd === 'A3PJ'
            ? 'Certificado Pessoa Jurídica Modelo A3 valido por 3 anos'
            : value.tipocd === 'A1PF'
              ? 'Certificado Pessoa Física Modelo A1 valido por 1 ano'
              : value.tipocd === 'A1PJ'
                ? 'Certificado Pessoa Jurídica Modelo A1 valido por 1 ano'
                : 'Certificado em nuvem modelo "Bird Id", valido por 5 anos';
      const Validacao =
        value.validacao === 'VIDEO GT' ? 'VIDEO CONF' : value.validacao;
      return {
        ...value,
        modelo,
        validacao: Validacao,
      };
    });

    return data;
  }

  async findByCnpj(cnpj: string): Promise<Fcweb[]> {
    return Fcweb.findAll({
      where: {
        cnpj: cnpj,
      },
    });
  }

  async findByName(name: string): Promise<Fcweb[]> {
    return Fcweb.findAll({
      where: {
        nome: {
          [Op.like]: `%${name}%`,
        },
      },
    });
  }

  async findByRazaoSocial(razaoSocial: string): Promise<Fcweb[]> {
    return Fcweb.findAll({
      where: {
        razaosocial: {
          [Op.like]: `%${razaoSocial}%`,
        },
      },
    });
  }

  async findByReferencia(referencia: string): Promise<Fcweb> {
    return Fcweb.findOne({
      where: {
        referencia: referencia,
      },
    });
  }

  async findManyByIds(ids: number[]): Promise<any[]> {
    const registros = await Fcweb.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      attributes: [
        'id',
        'andamento',
        'dt_agenda',
        'hr_agenda',
        'dt_aprovacao',
        'hr_aprovacao',
        'reg_cnh',
        'rg',
      ],
    });

    return registros.map((r) => r.dataValues);
  }
}
