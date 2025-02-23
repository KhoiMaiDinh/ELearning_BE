import {
  CursorPaginatedDto,
  CursorPaginationDto,
  Nanoid,
  OffsetPaginatedDto,
} from '@/common/index';
import { ErrorCode, RegisterMethod, SYSTEM_USER_ID } from '@/constants/index';
import { ValidationException } from '@/exceptions/index';
import { buildPaginator } from '@/utils/cursor-pagination';
import { paginate } from '@/utils/offset-pagination';
import { verifyPassword } from '@/utils/password.util';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { ChangePasswordReq } from './dto/change-password.req.dto';
import { CreateUserReqDto } from './dto/create-user.req.dto';
import { ListUserReqDto } from './dto/list-user.req.dto';
import { LoadMoreUsersReqDto } from './dto/load-more-users.req.dto';
import { UpdateUserReqDto } from './dto/update-user.req.dto';
import { UserRes } from './dto/user.res.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserReqDto): Promise<UserRes> {
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

    return plainToInstance(UserRes, savedUser);
  }

  async findAll(reqDto: ListUserReqDto): Promise<OffsetPaginatedDto<UserRes>> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');
    const [users, metaDto] = await paginate<UserEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });
    return new OffsetPaginatedDto(plainToInstance(UserRes, users), metaDto);
  }

  async loadMoreUsers(
    reqDto: LoadMoreUsersReqDto,
  ): Promise<CursorPaginatedDto<UserRes>> {
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

    return new CursorPaginatedDto(plainToInstance(UserRes, data), metaDto);
  }

  async findOne(id: Nanoid): Promise<UserRes> {
    assert(id, 'id is required');
    const user = await this.userRepository.findOneByOrFail({ id });

    return user.toDto(UserRes);
  }

  async update(id: Nanoid, updateUserDto: UpdateUserReqDto) {
    const user = await this.userRepository.findOneByOrFail({ id });

    user.profile_image = updateUserDto.profile_image;
    user.updatedBy = SYSTEM_USER_ID;

    await this.userRepository.save(user);
  }

  async remove(id: Nanoid) {
    await this.userRepository.findOneByOrFail({ id });
    await this.userRepository.softDelete(id);
  }

  async changePassword(user_id: Nanoid, dto: ChangePasswordReq) {
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
