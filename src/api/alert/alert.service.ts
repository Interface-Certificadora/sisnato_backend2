import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { UserPayload } from '../../auth/entities/user.entity';
import { ErrorEntity } from '../../entities/error.entity';
import { LogService } from '../../log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';

@Injectable()
export class AlertService {
  constructor(
    private Log: LogService,
    private prisma: PrismaService,
    private sms: SmsService,
  ) {}
  private readonly logger = new Logger(AlertService.name, { timestamp: true });

  async create(data: CreateAlertDto, User: UserPayload) {
    try {
      const req = await this.prisma.alert.create({ data });
      const Alert = await this.prisma.alert.findUnique({
        where: { id: req.id },
        include: {
          corretorData: true,
          empreendimentoData: true,
          solicitacao: true,
        },
      });
      await this.Log.Post({
        User: User.id,
        EffectId: req.id,
        Rota: 'Alert',
        Descricao: `Alerta Criado por ${User.id}-${User.nome} para solicitação ${Alert.solicitacao.nome} com operador ${Alert.corretorData.nome}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      if (Alert.corretor) {
        await this.sms.sendSms(
          `🚨🚨🚨*Sis Nato Informa*🚨🚨🚨\n\ncliente: ${data.titulo}\n${data.descricao}`,
          Alert.corretorData.telefone,
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
      if(!User.role.alert && User.hierarquia !== 'ADM'){
        throw new Error('Usuario nao tem permissao para acessar essa rota');
      }
      const req = await this.prisma.alert.findMany({
        where: {
          ...(User.role.alert && { corretor: User.id }),
        },
        orderBy: { createdAt: 'desc' },
      });
      return req;
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

  count(User: UserPayload) {
    try {
      if(!User.role.alert && User.hierarquia !== 'ADM'){
        throw new Error('Usuario nao tem permissao para acessar essa rota');
      }
      const req = this.prisma.alert.count({
        where: {
          ...(User.role.alert && { status: true, corretor: User.id }),
        },
      });
      return req;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar o total de alertas:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async findOne(id: number, User: UserPayload) {
    try {
      if(!User.role.alert && User.hierarquia !== 'ADM'){
        throw new Error('Usuario nao tem permissao para acessar essa rota');
      }
      return await this.prisma.alert.findMany({
        where: { corretor: id, status: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
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
          status: true,
          ...(User.hierarquia === 'USER' && { corretor: User.id }),
        },
        orderBy: { createdAt: 'desc' },
      });
      return req;
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async update(id: number, data: UpdateAlertDto, User: UserPayload) {
    try {
      await this.prisma.alert.update({
        where: { id },
        data,
      });
      const Alert = await this.prisma.alert.findUnique({
        where: { id },
        include: {
          corretorData: true,
          empreendimentoData: true,
          solicitacao: true,
        },
      });
      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Alert',
        Descricao: `Alerta Criado por ${User.id}-${User.nome} para solicitação ${Alert.solicitacao.nome} com operador ${Alert.corretorData.nome}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      if (Alert.corretor) {
        await this.sms.sendSms(
          `🚨🚨🚨*Sis Nato Informa*🚨🚨🚨\n\nNova Atualização\ncliente: ${data.titulo}\n${data.texto}`,
          Alert.corretorData.telefone,
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
      const Alert = await this.prisma.alert.findUnique({
        where: { id },
        include: {
          corretorData: true,
          empreendimentoData: true,
          solicitacao: true,
        },
      });
      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Alert',
        Descricao: `Alerta Criado por ${User.id}-${User.nome} para solicitação ${Alert.solicitacao.nome} com operador ${Alert.corretorData.nome}  - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      await this.prisma.alert.update({
        where: { id },
        data: { status: false },
      });
      return 'Alerta removido';
    } catch (error) {
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }
}
