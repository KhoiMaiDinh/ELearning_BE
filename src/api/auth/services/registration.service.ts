import { RoleRepository } from '@/api/role/entities/role.repository';
import { TokenService } from '@/api/token/token.service';
import { JwtPayloadType } from '@/api/token/types';
import { UserEntity } from '@/api/user/entities/user.entity';
import { IEmailJob, IVerifyEmailJob } from '@/common/index';
import { AllConfigType } from '@/config/config.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { CacheKey } from '@/constants/cache.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { JobName, QueueName } from '@/constants/job.constant';
import { RegisterMethod } from '@/constants/register-method.enum';
import { DefaultRole } from '@/constants/role.constant';
import { NotFoundException } from '@/exceptions/not-found.exception';
import { RequestThrottledException } from '@/exceptions/request-throttled.exception';
import { ValidationException } from '@/exceptions/validation.exception';
import { createCacheKey } from '@/utils/cache.util';
import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import ms from 'ms';
import { Repository } from 'typeorm';
import * as DTO from '../dto';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly tokenService: TokenService,
    @InjectQueue(QueueName.EMAIL)
    private readonly emailQueue: Queue<IEmailJob, any, string>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly roleRepository: RoleRepository,
  ) {}

  async emailRegister(dto: DTO.EmailRegisterReq): Promise<DTO.RegisterRes> {
    // Check if the user already exists
    const isExistUser = await UserEntity.exists({
      where: { email: dto.email, register_method: RegisterMethod.LOCAL },
    });

    if (isExistUser) {
      throw new ValidationException(ErrorCode.E003);
    }

    const role = await this.roleRepository.getRoleByRoleName(
      DefaultRole.STUDENT,
    );

    // Register user
    const user = new UserEntity({
      email: dto.email,
      password: dto.password,
      first_name: dto.first_name,
      last_name: dto.last_name,
      register_method: RegisterMethod.LOCAL,
      roles: [role],
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });

    await user.save();

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
      throw new ValidationException(ErrorCode.E003);
    }

    const role = await this.roleRepository.getRoleByRoleName(
      DefaultRole.STUDENT,
    );

    // Register user
    const user = new UserEntity({
      email: email,
      facebook_id: facebook_id,
      username: username,
      first_name: first_name,
      last_name: last_name,
      register_method: RegisterMethod.FACEBOOK,
      roles: [role],
      is_verified: true,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });

    await user.save();

    return plainToInstance(DTO.RegisterRes, {
      user_id: user.id,
    });
  }

  async googleRegister(dto: DTO.GoogleRegisterReq): Promise<DTO.RegisterRes> {
    const { email, google_id, first_name, last_name, username } = dto;
    // Check if the user already exists
    const isExistUser = await UserEntity.exists({
      where: { google_id: google_id },
    });

    if (isExistUser) {
      throw new ValidationException(ErrorCode.E003);
    }

    const role = await this.roleRepository.getRoleByRoleName(
      DefaultRole.STUDENT,
    );

    // Register user
    const user = new UserEntity({
      email: email,
      google_id: google_id,
      first_name: first_name,
      last_name: last_name,
      username: username,
      register_method: RegisterMethod.GOOGLE,
      roles: [role],
      is_verified: true,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });

    await user.save();

    return plainToInstance(DTO.RegisterRes, {
      user_id: user.id,
    });
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
      createCacheKey(CacheKey.EMAIL_VERIFICATION, user.id),
      token,
      ms(tokenExpiresIn),
    );
    await this.cacheManager.set(
      createCacheKey(CacheKey.EMAIL_VERIFICATION_TIME, user.id),
      token,
      ms(tokenExpiresIn),
    );
    await this.emailQueue.add(
      JobName.EMAIL_VERIFICATION,
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
    const user = await this.userRepository.findOneBy({
      id: userToken.id,
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.E002, 'User not found');
    }
    const retryTimestamp = await this.cacheManager.get<Date>(
      createCacheKey(CacheKey.EMAIL_VERIFICATION_TIME, user.id),
    );
    if (retryTimestamp) {
      throw new RequestThrottledException(
        ErrorCode.E006,
        'You can only request email verification once every minute',
        retryTimestamp,
      ); // Less than 1 minute has passed
    }
    await this.sendVerificationEmail(user);
  }

  async verifyEmail(dto: DTO.VerifyEmailReq) {
    const payload = this.tokenService.verifyVerificationToken(dto.token);

    const user = await this.userRepository.findOneBy({
      id: payload.id,
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.E002, 'User not found');
    }

    const verifyEmailToken = await this.cacheManager.get<string>(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, user.id),
    );

    if (!verifyEmailToken || verifyEmailToken !== dto.token) {
      throw new NotFoundException(
        ErrorCode.E010,
        'Email verification token not found or invalid',
      );
    }

    user.is_verified = true;
    user.updatedBy = SYSTEM_USER_ID;
    await user.save();

    await this.cacheManager.del(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, user.id),
    );
  }
}
