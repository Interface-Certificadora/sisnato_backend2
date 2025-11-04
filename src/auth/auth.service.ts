import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

type UserWithRelations = {
  id: number;
  nome: string | null;
  username: string;
  telefone: string | null;
  hierarquia: string | null;
  cargo: string | null;
  status: boolean;
  password_key: string | null;
  password: string | null;
  role: unknown;
  construtoras: Array<{ construtoraId: number }>;
  empreendimentos: Array<{ empreendimentoId: number }>;
  financeiros: Array<{ financeiroId: number }>;
};

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) { }
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  /**
   * Realiza o fluxo de autenticação do usuário, validando credenciais, gerando o token JWT
   * e registrando os dados de login no histórico da aplicação.
   */
  async Login(data: LoginDto) {
    try {
      const user = await this.userLoginRequest(data.username);
      if (!user) {
        throw new HttpException(
          { message: 'Usuário e senha incorretos' },
          400,
        );
      }

      await this.ensureActiveUser(user);
      await this.ensureValidPassword(data.password, user);

      const payload = this.buildJwtPayload(user);
      const result = this.buildLoginResponse(user, payload);

      await this.registerUserLoginMetadata(user, data);

      return result;
    } catch (error) {
      this.logger.error('Erro ao logar:', JSON.stringify(error, null, 2));

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        { message: 'Falha ao processar a autenticação' },
        400,
      );
    }
  }

  /**
   * Recupera o usuário e relacionamentos necessários para o fluxo de autenticação.
   */
  async userLoginRequest(username: string) {
    try {
      const request = await this.prismaService.user.findFirst({
        where: {
          username,
        },
        select: {
          id: true,
          nome: true,
          username: true,
          telefone: true,
          hierarquia: true,
          cargo: true,
          status: true,
          password_key: true,
          password: true,
          role: true,
          construtoras: {
            select: {
              construtoraId: true,
            },
          },
          empreendimentos: {
            select: {
              empreendimentoId: true,
            },
          },
          financeiros: {
            select: {
              financeiroId: true,
            },
          },
        },
      });

      if (!request) {
        return null;
      }

      return request as UserWithRelations;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar Usuario:',
        JSON.stringify(error, null, 2),
      );
      throw error;
    }
  }

  /**
   * Garante que o usuário esteja ativo antes de liberar o acesso à aplicação.
   */
  private async ensureActiveUser(user: UserWithRelations): Promise<void> {
    if (!user.status) {
      throw new HttpException(
        { message: 'Usuário inativo, contate o administrador' },
        400,
      );
    }
  }

  /**
   * Valida a senha informada utilizando o hash ou valor legado quando disponível.
   */
  private async ensureValidPassword(
    password: string,
    user: UserWithRelations,
  ): Promise<void> {
    const isHashValid = await this.validateHashedPassword(password, user);

    if (isHashValid) {
      return;
    }

    const isLegacyValid = this.validateLegacyPassword(password, user);

    if (isLegacyValid) {
      this.logger.warn(
        `Usuário ${user.username} autenticado utilizando senha legada em texto claro.`,
      );
      return;
    }

    throw new HttpException({ message: 'Usuário e senha incorretos' }, 400);
  }

  /**
   * Tenta validar a senha utilizando o hash armazenado.
   */
  private async validateHashedPassword(
    password: string,
    user: UserWithRelations,
  ): Promise<boolean> {
    if (!user.password_key) {
      return false;
    }

    return bcrypt.compare(password, user.password_key);
  }

  /**
   * Tenta validar a senha utilizando o valor legado em texto claro.
   */
  private validateLegacyPassword(
    password: string,
    user: UserWithRelations,
  ): boolean {
    if (!user.password) {
      return false;
    }

    return password === user.password;
  }

  /**
   * Monta o payload que será inserido no token JWT.
   */
  private buildJwtPayload(user: UserWithRelations) {
    return {
      id: user.id,
      nome: user.nome,
      construtora: this.extractRelationIds(user.construtoras, 'construtoraId'),
      empreendimento: this.extractRelationIds(
        user.empreendimentos,
        'empreendimentoId',
      ),
      hierarquia: user.hierarquia,
      Financeira: this.extractRelationIds(user.financeiros, 'financeiroId'),
      role: user.role,
    };
  }

  /**
   * Monta a resposta de autenticação que será retornada para a aplicação cliente.
   */
  private buildLoginResponse(user: UserWithRelations, payload: any) {
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        telefone: user.telefone,
        hierarquia: user.hierarquia,
        cargo: user.cargo,
      },
    };
  }

  /**
   * Registra metadados de acesso do usuário para fins de auditoria.
   */
  private async registerUserLoginMetadata(
    user: UserWithRelations,
    data: LoginDto,
  ): Promise<void> {
    const geolocationData = data.geolocation ?? {};
    const ipData = data.ip ?? 'indisponível';
    const userName = user.nome ?? user.username ?? 'indisponível';

    try {
      const req = await this.prismaService.userlogin.create({
        data: {
          userId: user.id,
          nome: userName,
          ip: ipData,
          geolocation: geolocationData,
          createdAt: this.generateSaoPauloTimestamp(),
        },
      });
      this.logger.log('Dados de geolocalização de login registrados com sucesso.', req);
    } catch (error) {
      this.logger.warn(
        'Falha ao registrar dados de geolocalização do login:',
        JSON.stringify(error, null, 2),
      );
    }
  }

  /**
   * Normaliza a extração de identificadores numéricos de relacionamentos.
   */
  private extractRelationIds<T extends Record<string, unknown>>(
    items: T[] | undefined,
    key: keyof T,
  ): number[] {
    if (!items?.length) {
      return [];
    }

    return items
      .map((item) => Number(item[key]))
      .filter((id) => Number.isFinite(id));
  }

  /**
   * Gera um carimbo de data/hora alinhado ao fuso-horário de São Paulo.
   */
  private generateSaoPauloTimestamp(): Date {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - 3);
    return timestamp;
  }
}
