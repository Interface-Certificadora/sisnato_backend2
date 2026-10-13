import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatAcessoService } from '../chat-acesso.service';
import { CHAT_TOKEN_HEADER } from '../chat.util';

/** Valida o token do navegador (header X-Chat-Token) e preenche request.chat */
@Injectable()
export class ChatClienteGuard implements CanActivate {
  constructor(private readonly acesso: ChatAcessoService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers[CHAT_TOKEN_HEADER];
    const dispositivo = await this.acesso.validarToken(
      typeof token === 'string' ? token : '',
    );
    if (!dispositivo) {
      throw new UnauthorizedException('Sessão do chat inválida ou expirada');
    }
    request.chat = dispositivo;
    return true;
  }
}
