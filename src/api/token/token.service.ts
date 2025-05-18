import { Nanoid } from '@/common';
import { AllConfigType } from '@/config';
import { CacheKey, ErrorCode, PERMISSION } from '@/constants';
import { UnauthorizedException } from '@/exceptions';
import { createCacheKey } from '@/utils/cache.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import ms from 'ms';
import {
  JwtPayloadType,
  JwtRefreshPayloadType,
  JwtVerificationPayloadType,
  Token,
} from './types';

@Injectable()
export class TokenService {
  private logger = new Logger(TokenService.name);
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(ErrorCode.E010);
      }
      if (
        error.name === 'JsonWebTokenError' &&
        error.message.includes('invalid secret')
      ) {
        throw new UnauthorizedException(ErrorCode.E009);
      }
      this.logger.debug('Verify token error', error);
      throw new UnauthorizedException(ErrorCode.V000);
    }

    // Force logout if the session is in the blacklist
    const is_session_blacklisted = await this.cacheManager.store.get<boolean>(
      createCacheKey(CacheKey.SESSION_BLACKLIST, payload.session_id),
    );

    if (is_session_blacklisted) {
      throw new UnauthorizedException(ErrorCode.E071);
    }

    if (payload.banned_until)
      throw new UnauthorizedException(
        ErrorCode.E077,
        `Bạn đã bị cấm cho đến ${new Date(payload.banned_until)
          .toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour12: false,
          })
          .replace(',', '')}`,
      );

    return payload;
  }

  verifyVerificationToken(token: string): JwtVerificationPayloadType {
    let payload: JwtVerificationPayloadType;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnauthorizedException(ErrorCode.E009);
    }
    return payload;
  }

  verifyRefreshToken(token: string): JwtRefreshPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.refreshSecret', {
          infer: true,
        }),
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(ErrorCode.E010);
      }
      if (
        error.name === 'JsonWebTokenError' &&
        error.message.includes('invalid secret')
      ) {
        throw new UnauthorizedException(ErrorCode.E009);
      }
      this.logger.debug('Verify token error', error);
      throw new UnauthorizedException(ErrorCode.V000);
    }
  }

  async createVerificationToken(data: { id: string }): Promise<string> {
    return await this.jwtService.signAsync(
      {
        id: data.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );
  }

  async create(data: {
    id: Nanoid;
    roles: string[];
    permissions: PERMISSION[];
    session_id: string;
    hash: string;
    banned_until?: Date;
  }): Promise<Token> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const token_expires = Date.now() + ms(tokenExpiresIn);
    const [access_token, refresh_token] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          roles: data.roles,
          permissions: data.permissions,
          session_id: data.session_id,
          banned_until: data?.banned_until,
        } as JwtPayloadType,
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          session_id: data.session_id,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);
    return {
      access_token,
      refresh_token,
      token_expires,
    } as Token;
  }
}
