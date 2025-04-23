import { HttpException, Injectable } from '@nestjs/common';
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

  async Login(data: LoginDto) {
    try {
      const user = await this.userLoginRequest(data.username);

      if (!user) {
        throw new HttpException({
          message: 'Usuário e senha incorretos3',
        }, 400);
      }
      const isValid = bcrypt.compareSync(data.password, user.password_key);

      if (!isValid) {
        throw new HttpException({
          message: 'Usuário e senha incorretos2',
        }, 400);
      }

      if (!user.status) {
        throw new HttpException({
          message: 'Usuário inativo, contate o administrador1',
        }, 400);
      }

      const Payload = {
        id: user.id,
        nome: user.nome,
        construtora: user.construtoras,
        empreendimento: user.empreendimentos,
        hierarquia: user.hierarquia,
        Financeira: user.financeiros,
      };
      const result = {
        token: this.jwtService.sign(Payload),
        user: {
          id: user.id,
          nome: user.nome,
          telefone: user.telefone,
          construtora: user.construtoras,
          empreendimento: user.empreendimentos,
          hierarquia: user.hierarquia,
          cargo: user.cargo,
          status: user.status,
          Financeira: user.financeiros,
          reset_password: user.reset_password,
          termos: user.termos,
        },
      };

      return result;
    } catch (error) {
      const retorno = {
        message: error.message,
      };
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
      return error;
    } finally {
      this.prismaService.$disconnect;
    }
  }
}
