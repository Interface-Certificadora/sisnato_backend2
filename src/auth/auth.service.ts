import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
    private emailService: MailService,
  ) {}
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  /**
   * Realiza o fluxo de autenticação do usuário, validando credenciais, gerando o token JWT
   * e registrando os dados de login no histórico da aplicação.
   */
  async Login(data: LoginDto) {
    try {
      const user = await this.userLoginRequest(data.username);
      if (!user) {
        throw new HttpException({ message: 'Usuário e senha incorretos' }, 400);
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
   * Executa de forma assíncrona e não bloqueante para não impactar performance do login.
   */
  private async registerUserLoginMetadata(
    user: UserWithRelations,
    data: LoginDto,
  ): Promise<void> {
    // Executa em background para não bloquear o login
    setTimeout(async () => {
      try {
        await this.saveUserLoginMetadata(user, data);
      } catch (error) {
        // Silenciosamente ignora erros para não afetar o fluxo principal
        this.logger.warn('Erro em background ao registrar metadados:', error);
      }
    }, 0);
  }

  /**
   * Salva os metadados de login no banco de dados com tratamento robusto de erros.
   */
  private async saveUserLoginMetadata(
    user: UserWithRelations,
    data: LoginDto,
  ): Promise<void> {
    const geolocationData: Record<string, any> = {};
    const ipData = this.sanitizeIp(data.ip);
    const userName = user.nome ?? user.username ?? 'indisponível';

    // Obtém geolocalização com timeout e tratamento de erros
    if (ipData && ipData !== 'indisponível') {
      const geoData = await this.fetchGeolocationData(ipData);
      if (geoData) {
        Object.assign(geolocationData, geoData);
      }
    }

    // Salva no banco com retry simples
    await this.saveLoginDataWithRetry({
      userId: user.id,
      nome: userName,
      ip: ipData,
      geolocation: geolocationData,
    });
  }

  /**
   * Sanitiza e valida o endereço IP.
   */
  private sanitizeIp(ip?: string): string {
    if (!ip || typeof ip !== 'string') {
      return 'indisponível';
    }

    // Validação básica de IPv4/IPv6
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipRegex.test(ip.trim()) ? ip.trim() : 'indisponível';
  }

  /**
   * Busca dados de geolocalização com timeout e tratamento de erros.
   */
  private async fetchGeolocationData(
    ip: string,
  ): Promise<Record<string, any> | null> {
    try {
      // Timeout de 5 segundos para não bloquear
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const geoReq = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SISNATO-Backend/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!geoReq.ok) {
        throw new Error(`API request failed: ${geoReq.status}`);
      }

      const geoData = await geoReq.json();
      console.log(
        '🚀 ~ AuthService ~ fetchGeolocationData ~ geoData:',
        geoData,
      );

      // Validação dos dados retornados
      if (!geoData || typeof geoData !== 'object') {
        return null;
      }

      // Retorna apenas os campos válidos
      const validGeoData: Record<string, any> = {};
      const fields = [
        'city',
        'region',
        'country_name',
        'timezone',
        'org',
        'latitude',
        'longitude',
      ];

      fields.forEach((field) => {
        if (
          geoData[field] &&
          typeof geoData[field] === 'string' &&
          geoData[field].trim()
        ) {
          const key =
            field === 'country_name'
              ? 'country'
              : field === 'org'
                ? 'operadora'
                : field === 'latitude'
                  ? 'lat'
                  : field === 'longitude'
                    ? 'lng'
                    : field;
          validGeoData[key] = geoData[field].trim();
        }
      });

      return Object.keys(validGeoData).length > 0 ? validGeoData : null;
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.warn('Timeout ao obter geolocalização para o IP:', ip);
      } else {
        this.logger.warn('Falha ao obter geolocalização:', error);
      }
      return null;
    }
  }

  /**
   * Salva dados no banco com retry simples em caso de falha.
   */
  private async saveLoginDataWithRetry(
    loginData: {
      userId: number;
      nome: string;
      ip: string;
      geolocation: Record<string, any>;
    },
    maxRetries: number = 2,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const DateAt = new Date();
        DateAt.setHours(DateAt.getHours() - 3);
        await this.prismaService.userlogin.create({
          data: {
            ...loginData,
            createdAt: DateAt,
          },
        });

        this.logger.log('Dados de login registrados com sucesso.');
        return; // Sucesso, sai do loop
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.warn(
            `Falha ao registrar dados de login após ${maxRetries} tentativas:`,
            error,
          );
          return;
        }

        // Espera um pouco antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
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

  async forgotPassword(login: string) {
    // 1. Procurar usuário por Email OU Username
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: login }, { username: login }],
      },
    });

    // 2. Verificações de segurança
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (!user.email) {
      // Caso ele tenha achado pelo username, mas o campo email esteja null no banco
      throw new BadRequestException(
        'Este usuário não possui um e-mail cadastrado para recuperação.',
      );
    }

    // 3. Gerar Token e Data de Expiração (1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    now.setHours(now.getHours() + 1);

    // 4. Salvar no Banco
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: token,
        reset_password_expires: now,
      },
    });

    // 5. Enviar o E-mail
    // Passamos user.email (que garantimos que existe no passo 2)
    await this.emailService.sendRecoverPasswordMail(
      user.email,
      user.nome || user.username,
      token,
    );

    return {
      message: 'Se os dados estiverem corretos, um e-mail foi enviado.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password } = dto;

    const user = await this.prismaService.user.findFirst({
      where: {
        reset_password_token: token,
      },
    });

    if (!user) {
      throw new NotFoundException('Token inválido ou não encontrado.');
    }

    const now = new Date();
    if (user.reset_password_expires < now) {
      throw new BadRequestException(
        'Este link de recuperação expirou. Solicite um novo.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: password,
        password_key: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    return {
      message: 'Senha alterada com sucesso! Você já pode fazer login.',
    };
  }
}
