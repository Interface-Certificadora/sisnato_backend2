import { HttpException, Injectable, Logger } from '@nestjs/common';
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
      const req = await this.prisma.alert.create({ data });
      const alertComplete = await this.prisma.alert.findUnique({
        where: { id: req.id },
        include: {
          corretor: true,
          solicitacao: true,
        },
      });

      if (alertComplete.corretor) {
        await this.Log.Post({
          User: User.id,
          EffectId: req.id,
          Rota: 'Alert',
          Descricao: `Alerta Criado por ${User.id}-${User.nome} para solicitação ${alertComplete.solicitacao.nome} com operador ${alertComplete.corretor.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
        });
      }

      if (alertComplete && alertComplete.corretor?.telefone) {
        // Disparo do WhatsApp com descrição
        this.sms.AlertSms(
          alertComplete.corretor.telefone,
          alertComplete.corretor.nome,
          alertComplete.solicitacao?.nome || 'Solicitação',
          alertComplete.solicitacao?.id || 0,
          alertComplete.descricao, // Passando a descrição aqui
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
      const req = await this.prisma.alert.findMany({
        where: {
          solicitacao_id: { not: null },
          status: true,
          ...(User.hierarquia !== 'ADM' && {
            corretor_id: User.id,
          }),
        },
        orderBy: { createdAt: 'desc' },
      });
      return req ?? [];
    } catch (error) {
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async markAsRead(id: number, User: UserPayload) {
    try {
      return await this.prisma.alert.update({
        where: { id },
        data: { lido: true },
      });
    } catch (error) {
      throw new HttpException({ message: 'Erro ao marcar como lida' }, 400);
    }
  }

  async count(User: UserPayload) {
    try {
      const req = await this.prisma.alert
        .count({
          where: {
            ...(User.hierarquia === 'ADM' && { status: true }),
            ...(User.role?.alert &&
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
      const req = await this.prisma.alert.findMany({
        where: {
          solicitacao_id: id,
        },
        orderBy: { createdAt: 'desc' },
        include: { corretor: true },
      });
      return req;
    } catch (error) {
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async update(id: number, data: UpdateAlertDto, User: UserPayload) {
    try {
      if (!User.role?.alert && User.hierarquia !== 'ADM') {
        throw new Error(
          'Voce nao tem permissao para atualizar esse alerta, entre em contato com os administradores',
        );
      }

      const updatePayload: Prisma.AlertUncheckedUpdateInput = {};

      if (data.descricao !== undefined) {
        updatePayload.descricao = data.descricao;
      }
      if (data.hasOwnProperty('solicitacao_id')) {
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

      if (Alert.corretor.telefone) {
        await this.sms.AlertSms(
          Alert.corretor.telefone,
          Alert.corretor.nome,
          Alert.solicitacao.nome,
          Alert.solicitacao.id,
          Alert.descricao,
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
      // Se quiser que o corretor possa "limpar" a própria notificação:
      await this.prisma.alert.update({
        where: { id },
        data: { status: false }, // Isso "remove" da lista do findAll
      });
      return { message: 'Alerta removido da visualização' };
    } catch (error) {
      throw new HttpException({ message: error.message }, 400);
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
