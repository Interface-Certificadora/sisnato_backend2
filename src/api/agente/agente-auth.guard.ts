import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgenteAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers['agent-key'] || request.headers['AGENT-KEY'];

    const tokenValido = this.configService.get<string>('INTERFACE_AGENTE_KEY');

    if (!apiKey || apiKey !== tokenValido) {
      throw new UnauthorizedException(
        'Acesso negado: AGENT-KEY inválida ou ausente.',
      );
    }

    return true;
  }
}
