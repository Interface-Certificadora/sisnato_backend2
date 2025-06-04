import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { UserPayload } from '../../auth/entities/user.entity';
import { ErrorEntity } from '../../entities/error.entity';
import { LogService } from '../../log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SmsService } from '../../sms/sms.service';

@Injectable()
export class AlertService {
  constructor(
    private Log: LogService,
    private prisma: PrismaService,
    private sms: SmsService,
  ) {}
  private readonly logger = new Logger(AlertService.name, { timestamp: true });

  async create(data: any, User: UserPayload) {
    try {
      console.log('🚀 ~ AlertService ~ create ~ data:', data);
      const req = await this.prisma.alert.create({ data });
      const Alert = await this.prisma.alert.findUnique({
        where: { id: req.id },
        include: {
          corretor: true,
          solicitacao: true,
        },
      });
      console.log('🚀 ~ AlertService ~ create ~ Alert:', Alert);
      
      if (Alert.corretor) {
        await this.Log.Post({
          User: User.id,
          EffectId: req.id,
          Rota: 'Alert',
          Descricao: `Alerta Criado por ${User.id}-${User.nome} para solicitação ${Alert.solicitacao.nome} com operador ${Alert.corretor.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
        });
        await this.sms.sendSms(
          `🚨🚨🚨*Sis Nato Informa*🚨🚨🚨\n\ncliente: ${data.titulo}\n${data.descricao}`,
          Alert.corretor.telefone,
        );
      }

      return req;
    } catch (error) {
      this.logger.error(
        'Erro ao criar alerta:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async findAll(User: UserPayload) {
    try {
      if (!User.role.alert && User.hierarquia !== 'ADM') {
        throw new Error('Usuario nao tem permissao para acessar essa rota');
      }
      const req = await this.prisma.alert.findMany({
        where: {
          ...(User.hierarquia === 'ADM' && { status: true }),
          ...(User.role.alert &&
            User.hierarquia !== 'ADM' && {
              corretor: {
                id: User.id,
              },
            }),
        },
        orderBy: { status: 'desc' },
      });
      return req ?? [];
    } catch (error) {
      this.logger.error(
        'Erro ao buscar todos os alertas:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async count(User: UserPayload) {
    try {
      if (!User.role.alert && User.hierarquia !== 'ADM') {
        throw new Error('Usuario nao tem permissao para acessar essa rota');
      }
      const req = await this.prisma.alert
        .count({
          where: {
            ...(User.hierarquia === 'ADM' && { status: true }),
            ...(User.role.alert &&
              User.hierarquia !== 'ADM' && {
                status: true,
                corretor: { id: User.id },
              }),
          },
        })
        .catch(() => null);

      return req ?? 0;
    } catch (error) {
      if (
        error.message === 'Usuario nao tem permissao para acessar essa rota'
      ) {
        throw new HttpException({ message: error.message }, 400);
      }
      return 0;
    }
  }

  async findOne(id: number, User: UserPayload) {
    try {
      if (!User.role.alert && User.hierarquia !== 'ADM') {
        throw new Error('Usuario nao tem permissao para acessar essa rota');
      }
      const req = await this.prisma.alert.findFirst({
        where: { id: id },
        include: {
          corretor: true,
          solicitacao: true,
        },
      });
      if (!req.status) {
        throw new Error('Alerta finalizado');
      }
      return req;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar alerta pelo id:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async GetSolicitacaoAlerta(User: UserPayload, id: number) {
    try {
      if (!User.role.alert && User.hierarquia !== 'ADM') {
        throw new Error(
          'Voce nao tem permissao para essa solicitacao, entre em contato com os administradores',
        );
      }
      const req = await this.prisma.alert.findMany({
        where: {
          solicitacao_id: id,
          ...(User.role.alert && User.hierarquia === 'ADM'
            ? {}
            : { corretor_id: User.id }),
        },
        orderBy: { status: 'desc' },
        include: {
          corretor: true,
        },
      });
      return req;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar alertas pelo id da solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async update(id: number, data: UpdateAlertDto, User: UserPayload) {
    try {
      if (!User.role.alert && User.hierarquia !== 'ADM') {
        throw new Error(
          'Voce nao tem permissao para atualizar esse alerta, entre em contato com os administradores',
        );
      }

      const updatePayload: Prisma.AlertUncheckedUpdateInput = {};

      if (data.descricao !== undefined) {
        updatePayload.descricao = data.descricao;
      }
      // Para campos FK opcionais, precisamos lidar com null e undefined
      // Se data.solicitacao_id for undefined, não o incluímos (sem alteração)
      // Se data.solicitacao_id for null, definimos como null no banco de dados
      // Se data.solicitacao_id for um número, definimos o novo valor
      if (data.hasOwnProperty('solicitacao_id')) {
        // Verifica se a propriedade existe, mesmo que seja null
        updatePayload.solicitacao_id = data.solicitacao_id;
      }
      if (data.hasOwnProperty('corretor_id')) {
        updatePayload.corretor_id = data.corretor_id;
      }
      if (data.status !== undefined) {
        updatePayload.status = data.status;
      }

      await this.prisma.alert.update({
        where: { id },
        data: updatePayload,
      });

      const Alert = await this.prisma.alert.findUnique({
        where: { id },
        include: {
          corretor: true,
          solicitacao: true,
        },
      });

      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Alert',
        Descricao: `Alerta Criado por ${User.id}-${User.nome} para solicitação ${Alert.solicitacao.nome} com operador ${Alert.corretor.nome}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      if (Alert.corretor) {
        await this.sms.sendSms(
          `🚨🚨🚨*Sis Nato Informa*🚨🚨🚨\n\nNova Atualização\ncliente: ${Alert.solicitacao.nome}\n${data.descricao}`,
          Alert.corretor.telefone,
        );
      }

      return Alert;
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async remove(id: number, User: UserPayload) {
    try {
      if (User.hierarquia !== 'ADM') {
        throw new Error(
          'Voce nao tem permissao para remover esse alerta, entrar em contato com os administradores',
        );
      }
      const Alert = await this.prisma.alert.findUnique({
        where: { id },
        include: {
          corretor: true,
          solicitacao: true,
        },
      });
      console.log("🚀 ~ AlertService ~ remove ~ Alert:", Alert)
      
      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Alert',
        Descricao: `Alerta Removido por ${User.id}-${User.nome} para solicitação ${Alert.solicitacao.nome} pelo operador ${Alert.corretor?.nome || User.nome}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      await this.prisma.alert.update({
        where: { id },
        data: { status: false },
      });
      return { message: 'Alerta removido'};
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async GetAllGeral() {
    try {
      const req = await this.prisma.alert.findMany({
        where: {
          status: true,
          corretor_id: null,
          solicitacao_id: null,
        },
        include: {
          solicitacao: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return req ?? [];
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }
}
