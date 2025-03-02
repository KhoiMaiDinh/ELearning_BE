import {
  CursorPaginatedDto,
  CursorPaginationDto,
  Nanoid,
  OffsetPaginatedDto,
} from '@/common';
import { ErrorCode, RegisterMethod, SYSTEM_USER_ID } from '@/constants';
import { ValidationException } from '@/exceptions';
import { buildPaginator, paginate, verifyPassword } from '@/utils';
import { Injectable, Logger } from '@nestjs/common';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';
import * as DTO from './dto';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './entities/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: DTO.CreateUserReqDto): Promise<DTO.UserRes> {
    const { username, email, password, profile_image } = dto;

    // check uniqueness of username/email
    const user = await this.userRepository.findOne({
      where: [
        {
          username,
        },
        {
          email,
        },
      ],
    });

    if (user) {
      throw new ValidationException(ErrorCode.E001);
    }

    const newUser = new UserEntity({
      username,
      email,
      password,
      profile_image,
      first_name: dto.first_name,
      last_name: dto.last_name,
      register_method: RegisterMethod.LOCAL,
    });

    const savedUser = await this.userRepository.save(newUser);
    this.logger.debug(savedUser);

    return plainToInstance(DTO.UserRes, savedUser);
  }

  async findAll(
    reqDto: DTO.ListUserReqDto,
  ): Promise<OffsetPaginatedDto<DTO.UserRes>> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');
    const [users, metaDto] = await paginate<UserEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });
    return new OffsetPaginatedDto(plainToInstance(DTO.UserRes, users), metaDto);
  }

  async loadMoreUsers(
    reqDto: DTO.LoadMoreUsersReqDto,
  ): Promise<CursorPaginatedDto<DTO.UserRes>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const paginator = buildPaginator({
      entity: UserEntity,
      alias: 'user',
      paginationKeys: ['createdAt'],
      query: {
        limit: reqDto.limit,
        order: 'DESC',
        afterCursor: reqDto.afterCursor,
        beforeCursor: reqDto.beforeCursor,
      },
    });

    const { data, cursor } = await paginator.paginate(queryBuilder);

    const metaDto = new CursorPaginationDto(
      data.length,
      cursor.afterCursor,
      cursor.beforeCursor,
      reqDto,
    );

    return new CursorPaginatedDto(plainToInstance(DTO.UserRes, data), metaDto);
  }

  async findOne(id: Nanoid): Promise<DTO.UserRes> {
    assert(id, 'id is required');
    const user = await this.userRepository.findOneByOrFail({ id });

    return user.toDto(DTO.UserRes);
  }

  async update(id: Nanoid, dto: DTO.UpdateUserReqDto): Promise<DTO.UserRes> {
    const user = await this.userRepository.findOneByOrFail({ id });

    Object.assign(user, { user, ...dto });
    user.updatedBy = SYSTEM_USER_ID;

    await this.userRepository.save(user);
    return user.toDto(DTO.UserRes);
  }

  async remove(id: Nanoid) {
    await this.userRepository.findOneByOrFail({ id });
    await this.userRepository.softDelete(id);
  }

  async changePassword(user_id: Nanoid, dto: DTO.ChangePasswordReq) {
    const user = await this.userRepository.findOneByOrFail({ id: user_id });

    if (!(user.register_method == RegisterMethod.LOCAL)) {
      throw new ValidationException(
        ErrorCode.E005,
        'Only local user can change password',
      );
    }

    const isPasswordValid = await verifyPassword(
      dto.current_password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationException(
        ErrorCode.E004,
        "Current Password doesn't match",
      );
    }

    user.password = dto.new_password;
    user.updatedBy = SYSTEM_USER_ID;

    await this.userRepository.save(user);
  }
}
