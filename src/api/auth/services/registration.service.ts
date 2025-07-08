import { PreferenceEntity } from '@/api/preference/entities/preference.entity';
import { RoleRepository } from '@/api/role/repositories/role.repository';
import { JwtPayloadType, TokenService } from '@/api/token';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserRepository } from '@/api/user/user.repository';
import { IEmailJob, IVerifyEmailJob } from '@/common';
import { AllConfigType } from '@/config';
import * as CONST from '@/constants';
import {
  NotFoundException,
  RequestThrottledException,
  ValidationException,
} from '@/exceptions';
import { createCacheKey } from '@/utils';
import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import ms from 'ms';
import * as DTO from '../dto';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly tokenService: TokenService,
    @InjectQueue(CONST.QueueName.EMAIL)
    private readonly emailQueue: Queue<IEmailJob, any, string>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async emailRegister(dto: DTO.EmailRegisterReq): Promise<DTO.RegisterRes> {
    // Check if the user already exists
    const is_exist_user = await UserEntity.exists({
      where: { email: dto.email, register_method: CONST.RegisterMethod.LOCAL },
    });

    if (is_exist_user) {
      throw new ValidationException(CONST.ErrorCode.E003);
    }

    const role = await this.roleRepository.getRoleByRoleName(
      CONST.DefaultRole.STUDENT,
    );

    // Register user
    const user = new UserEntity({
      email: dto.email,
      password: dto.password,
      first_name: dto.first_name,
      last_name: dto.last_name,
      register_method: CONST.RegisterMethod.LOCAL,
      roles: [role],
      createdBy: CONST.SYSTEM_USER_ID,
      updatedBy: CONST.SYSTEM_USER_ID,
    });

    await user.save();
    await this.createPreference(user);

    return await this.sendVerificationEmail(user);
  }

  async facebookRegister(
    dto: DTO.FacebookRegisterReq,
  ): Promise<DTO.RegisterRes> {
    const { email, facebook_id, first_name, last_name, username } = dto;
    // Check if the user already exists
    const isExistUser = await UserEntity.exists({
      where: { facebook_id: facebook_id },
    });

    if (isExistUser) {
      throw new ValidationException(CONST.ErrorCode.E003);
    }

    const role = await this.roleRepository.getRoleByRoleName(
      CONST.DefaultRole.STUDENT,
    );

    // Register user
    const user = new UserEntity({
      email: email,
      facebook_id: facebook_id,
      username: username,
      first_name: first_name,
      last_name: last_name,
      register_method: CONST.RegisterMethod.FACEBOOK,
      roles: [role],
      is_verified: true,
      createdBy: CONST.SYSTEM_USER_ID,
      updatedBy: CONST.SYSTEM_USER_ID,
    });

    await user.save();
    await this.createPreference(user);

    return plainToInstance(DTO.RegisterRes, {
      user_id: user.id,
    });
  }

  async googleRegister(dto: DTO.GoogleRegisterReq) {
    const { email, google_id, first_name, last_name } = dto;
    const is_exist_user = await UserEntity.exists({
      where: { google_id: google_id },
    });

    if (is_exist_user) {
      throw new ValidationException(CONST.ErrorCode.E003);
    }

    const role = await this.roleRepository.getRoleByRoleName(
      CONST.DefaultRole.STUDENT,
    );

    // Register user
    const user = new UserEntity({
      email: email,
      google_id: google_id,
      first_name: first_name,
      last_name: last_name,
      register_method: CONST.RegisterMethod.GOOGLE,
      roles: [role],
      is_verified: true,
      createdBy: CONST.SYSTEM_USER_ID,
      updatedBy: CONST.SYSTEM_USER_ID,
    });

    await this.userRepository.save(user);
    await this.createPreference(user);

    return user;
  }

  private async createPreference(user: UserEntity): Promise<void> {
    const preference = new PreferenceEntity({ user });
    await preference.save();
  }

  private async sendVerificationEmail(
    user: UserEntity,
  ): Promise<DTO.RegisterRes> {
    // Send email verification
    const token = await this.tokenService.createVerificationToken({
      id: user.id,
    });
    const tokenExpiresIn = this.configService.getOrThrow(
      'auth.confirmEmailExpires',
      {
        infer: true,
      },
    );
    await this.cacheManager.set(
      createCacheKey(CONST.CacheKey.EMAIL_VERIFICATION, user.id),
      token,
      ms(tokenExpiresIn),
    );
    await this.cacheManager.set(
      createCacheKey(CONST.CacheKey.EMAIL_VERIFICATION_TIME, user.id),
      token,
      ms(tokenExpiresIn),
    );
    await this.emailQueue.add(
      CONST.JobName.EMAIL_VERIFICATION,
      {
        email: user.email,
        token,
      } as IVerifyEmailJob,
      { attempts: 3, backoff: { type: 'exponential', delay: 60000 } },
    );

    return plainToInstance(DTO.RegisterRes, {
      user_id: user.id,
    });
  }

  async resendVerifyEmail(userToken: JwtPayloadType): Promise<void> {
    const user = await this.userRepository.findOneByPublicId(userToken.id);

    const retry_timestamp = await this.cacheManager.get<Date>(
      createCacheKey(CONST.CacheKey.EMAIL_VERIFICATION_TIME, user.id),
    );
    if (retry_timestamp) {
      throw new RequestThrottledException(
        CONST.ErrorCode.E022,
        undefined,
        retry_timestamp,
      ); // Less than 1 minute has passed
    }
    await this.sendVerificationEmail(user);
  }

  async verifyEmail(dto: DTO.VerifyEmailReq) {
    const payload = this.tokenService.verifyVerificationToken(dto.token);

    const user = await this.userRepository.findOneByPublicId(payload.id);

    const cache_key = createCacheKey(
      CONST.CacheKey.EMAIL_VERIFICATION,
      user.id,
    );
    const verify_email_token = await this.cacheManager.get<string>(cache_key);

    if (!verify_email_token || verify_email_token !== dto.token) {
      throw new NotFoundException(CONST.ErrorCode.E023);
    }

    user.is_verified = true;
    user.updatedBy = CONST.SYSTEM_USER_ID;
    await user.save();

    await this.cacheManager.del(cache_key);
  }
}
