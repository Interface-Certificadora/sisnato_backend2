import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtservice: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token de acesso requerido');
    }
    try {
      const payload = await this.jwtservice.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractPathUrl(request: Request): string | undefined {
    return request.path;
  }
}
