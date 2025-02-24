import { TokenService } from '@/api/token/token.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_AUTH_OPTIONAL, IS_PUBLIC } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_OPTIONAL,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeader(request);

    if (isAuthOptional && !accessToken) {
      return true;
    }
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    request['user'] = await this.tokenService.verifyAccessToken(accessToken);

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    console.log('request.headers.authorization', request.headers.authorization);
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
