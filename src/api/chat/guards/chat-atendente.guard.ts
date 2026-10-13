import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** ADM ou usuário com role.chat = true */
export function podeAtender(user: any): boolean {
  return user?.hierarquia === 'ADM' || user?.role?.chat === true;
}

/** Usar depois do AuthGuard, que preenche request.user */
@Injectable()
export class ChatAtendenteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!podeAtender(request.user)) {
      throw new ForbiddenException('Sem permissão para o atendimento do chat');
    }
    return true;
  }
}
