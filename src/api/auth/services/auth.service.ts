import { JwtPayloadType, TokenService } from '@/api/token';
import { SessionEntity, UserEntity, UserRepository } from '@/api/user';
import { IEmailJob, IVerifyEmailJob } from '@/common';
import { AllConfigType } from '@/config';
import {
  CacheKey,
  ErrorCode,
  JobName,
  Permission,
  QueueName,
  RegisterMethod,
  SYSTEM_USER_ID,
} from '@/constants';
import { RequestThrottledException } from '@/exceptions';
import { createCacheKey, verifyPassword } from '@/utils';
import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import crypto from 'crypto';
import ms from 'ms';
import * as DTO from '../dto';
import { OAuthService } from './oauth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly tokenService: TokenService,
    private readonly OAuthService: OAuthService,
    private readonly userRepository: UserRepository,
    @InjectQueue(QueueName.EMAIL)
    private readonly emailQueue: Queue<IEmailJob, any, string>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async resetPassword(dto: DTO.ResetPasswordReq): Promise<void> {
    const payload = this.tokenService.verifyVerificationToken(dto.token);

    const user = await this.userRepository.findOneByPublicId(payload.id);

    const passwordResetToken = await this.cacheManager.get<string>(
      createCacheKey(CacheKey.PASSWORD_RESET, user.id),
    );

    if (!passwordResetToken || passwordResetToken !== dto.token) {
      throw new NotFoundException(
        ErrorCode.E002,
        'Password reset token not found or invalid',
      );
    }

    user.password = dto.password;
    user.updatedBy = SYSTEM_USER_ID;
    await user.save();

    await this.cacheManager.del(
      createCacheKey(CacheKey.PASSWORD_RESET, user.id),
    );
  }

  async forgotPassword(dto: DTO.ForgotPasswordReq): Promise<void> {
    const user = await this.userRepository.findOneByEmail(
      dto.email,
      RegisterMethod.LOCAL,
    );

    const retryTimestamp = await this.cacheManager.get<Date>(
      createCacheKey(CacheKey.PASSWORD_RESET_TIME, user.id),
    );
    if (retryTimestamp) {
      throw new RequestThrottledException(
        ErrorCode.E006,
        'You can only request password reset once every minute',
        retryTimestamp,
      ); // Less than 1 minute has passed
    }

    const token = await this.tokenService.createVerificationToken({
      id: user.id,
    });
    const tokenExpiresIn = this.configService.get('auth.confirmEmailExpires', {
      infer: true,
    });
    await this.cacheManager.set(
      createCacheKey(CacheKey.PASSWORD_RESET, user.id),
      token,
      ms(tokenExpiresIn),
    );
    await this.cacheManager.set(
      createCacheKey(CacheKey.PASSWORD_RESET_TIME, user.id),
      new Date(Date.now() + ms('1m')),
      ms('1m'),
    );

    await this.emailQueue.add(
      JobName.FORGOT_PASSWORD,
      {
        email: user.email,
        token,
      } as IVerifyEmailJob,
      { attempts: 3, backoff: { type: 'exponential', delay: 60000 } },
    );
  }

  /**
   * Log in user
   * @param dto LoginReqDto
   * @returns LoginResDto
   */
  async emailLogIn(dto: DTO.EmailLoginReq): Promise<DTO.LoginRes> {
    const { email, password } = dto;
    const register_method = RegisterMethod.LOCAL;
    const load_roles = true;
    const user = await this.userRepository.findOneByEmail(
      email,
      register_method,
      load_roles,
    );

    const is_valid_password: boolean = await verifyPassword(
      password,
      user.password,
    );

    if (!is_valid_password) {
      throw new UnauthorizedException(
        ErrorCode.E004,
        'Invalid email or password',
      );
    }

    return await this.afterLogIn(user);
  }

  async facebookLogIn(dto: DTO.FacebookLoginReq): Promise<DTO.LoginRes> {
    const { input_token } = dto;

    const facebook_id =
      await this.OAuthService.verifyFacebookInputToken(input_token);
    const user = await this.userRepository.findOne({
      where: { facebook_id: facebook_id },
      relations: ['roles', 'roles.permissions'],
    });

    return await this.afterLogIn(user);
  }

  async googleLogIn(dto: DTO.GoogleLoginReq): Promise<DTO.LoginRes> {
    const { id_token } = dto;

    const google_id = await this.OAuthService.verifyGoggleIDToken(id_token);
    const user = await this.userRepository.findOne({
      where: { google_id: google_id },
      relations: ['roles', 'roles.permissions'],
    });

    return await this.afterLogIn(user);
  }

  private async afterLogIn(user: UserEntity): Promise<DTO.LoginRes> {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = new SessionEntity({
      hash,
      user_id: user.user_id,
    });
    await session.save();

    const permission_set = new Set<Permission>();

    const roles = user.roles.map((role) => {
      role.permissions.forEach((permission) => {
        permission_set.add(permission.permission_key);
      });
      return role.role_name;
    });

    const permissions = Array.from(permission_set);

    const token = await this.tokenService.createToken({
      id: user.id,
      roles: roles,
      permissions: permissions,
      session_id: session.id,
      hash,
    });

    return plainToInstance(DTO.LoginRes, {
      user_id: user.id,
      ...token,
    });
  }

  async logout(userToken: JwtPayloadType): Promise<void> {
    await this.cacheManager.store.set<boolean>(
      createCacheKey(CacheKey.SESSION_BLACKLIST, userToken.sessionId),
      true,
      userToken.exp * 1000 - Date.now(),
    );
    await SessionEntity.delete(userToken.sessionId);
  }

  async refreshToken(dto: DTO.RefreshReq): Promise<DTO.RefreshRes> {
    const { sessionId, hash } = this.tokenService.verifyRefreshToken(
      dto.refreshToken,
    );
    const session = await SessionEntity.findOneBy({ id: sessionId });

    if (!session || session.hash !== hash) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOneOrFail({
      where: { user_id: session.user_id },
      relations: ['roles', 'roles.permissions'],
    });

    const newHash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    SessionEntity.update(session.id, { hash: newHash });

    const permissions = user.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.permission_key),
    );

    return await this.tokenService.createToken({
      id: user.id,
      roles: user.roles.map((role) => role.role_name),
      permissions: permissions,
      session_id: session.id,
      hash: newHash,
    });
  }
}
