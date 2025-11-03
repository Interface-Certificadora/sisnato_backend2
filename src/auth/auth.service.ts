import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
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
        throw new HttpException(
          {
            message: 'Usuário e senha incorretos',
          },
          400,
        );
      }
      const isValid = bcrypt.compareSync(data.password, user.password_key);

      if (!isValid) {
        throw new HttpException(
          {
            message: 'Usuário e senha incorretos',
          },
          400,
        );
      }

      if (!user.status) {
        throw new HttpException(
          {
            message: 'Usuário inativo, contate o administrador',
          },
          400,
        );
      }

      const Payload = {
        id: user.id,
        nome: user.nome,
        construtora: user.construtoras.map(
          (item: { construtoraId: any }) => item.construtoraId,
        ),
        empreendimento: user.empreendimentos.map(
          (item: { empreendimentoId: any }) => item.empreendimentoId,
        ),
        hierarquia: user.hierarquia,
        Financeira: user.financeiros.map(
          (item: { financeiroId: any }) => item.financeiroId,
        ),
        role: user.role,
      };
      const result = {
        token: this.jwtService.sign(Payload),
        user: {
          id: user.id,
          nome: user.nome,
          telefone: user.telefone,
          hierarquia: user.hierarquia,
          cargo: user.cargo,
        },
      };

      const geolocationData = data.geolocation ?? {};
      const ipData = data.ip ?? 'indisponível';
      const nomeUsuario = user.nome ?? user.username ?? 'indisponível';

      try {
        const time = new Date();
        // set time to SP-br timezone
        time.setHours(time.getHours() - 3);
        
        await this.prismaService.userlogin.create({
          data: {
            userId: user.id,
            nome: nomeUsuario,
            ip: ipData,
            geolocation: geolocationData,
            createdAt: time,
          },
        });
      } catch (registerError) {
        this.logger.error(
          'Erro ao registrar login do usuário:',
          JSON.stringify(registerError, null, 2),
        );
      }

      return result;

    } catch (error) {
      const retorno = {
        message: error.message,
      };
      this.logger.error('Erro ao logar:', JSON.stringify(error, null, 2));
      throw new HttpException(retorno, 400);
    }
  }

  async userLoginRequest(username: string) {
    try {
      const request = await this.prismaService.user.findFirst({
        where: {
          username,
        },
        include: {
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

      const data = {
        ...request,
      };

      return data;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar Usuario:',
        JSON.stringify(error, null, 2),
      );
      return error;
    }
  }
}
