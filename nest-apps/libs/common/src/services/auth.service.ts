import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from '../types';
import { AllConfigType } from '../config/config.type';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
  ) {}

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException();
    }

    // // Force logout if the session is in the blacklist
    // const isSessionBlacklisted = await this.cacheManager.store.get<boolean>(
    //   createCacheKey(CacheKey.SESSION_BLACKLIST, payload.sessionId),
    // );

    // if (isSessionBlacklisted) {
    //   throw new UnauthorizedException();
    // }

    return payload;
  }
}
