// Libs
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Common
import {
  ErrorCode,
  RegisterMethod,
  Uuid,
  getRandomExternalId,
} from '@app/common';
//App
import { User } from '../entities/user.entity';
import { TeacherProfile } from '../entities/teacher-profile.entity';
import { CreateAccountReq } from '../../auth';
import { CreateFacebookUser, CreateGoogleUser, CreateUser } from '../dto';
import { CreateLocalUser } from '../dto/create-local-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(TeacherProfile)
    private readonly _teacherProfileRepository: Repository<TeacherProfile>,
  ) {}
  async create(request: CreateAccountReq): Promise<User> {
    let createUserDto: CreateUser;
    switch (request.register_method) {
      case RegisterMethod.GOOGLE:
        createUserDto = new CreateGoogleUser({
          google_id: request.google_id,
          profile_img: request.profile_img,
          email: request.email,
          first_name: request.first_name,
          last_name: request.last_name,
        });
        break;
      case RegisterMethod.FACEBOOK:
        createUserDto = new CreateFacebookUser({
          facebook_id: request.facebook_id,
          profile_img: request.profile_img,
          email: request.email,
          first_name: request.first_name,
          last_name: request.last_name,
        });
        break;
      case RegisterMethod.LOCAL:
        createUserDto = new CreateLocalUser({
          email: request.email,
          password: request.password,
          first_name: request.first_name,
          last_name: request.last_name,
        });
        break;
    }

    const newUser = new User({
      user_id: getRandomExternalId(8),
      ...createUserDto,
    });

    const savedUser = await this._userRepository.save(newUser);
    return savedUser;
  }

  async getOneBySocialID(
    social_id: string,
    social_type: RegisterMethod,
  ): Promise<User> {
    try {
      switch (social_type) {
        case RegisterMethod.GOOGLE: {
          return await this._userRepository.findOneByOrFail({
            google_id: social_id,
          });
        }
        case RegisterMethod.FACEBOOK: {
          return await this._userRepository.findOneByOrFail({
            facebook_id: social_id,
          });
        }
      }
    } catch (error) {
      throw new NotFoundException(
        `User with ${social_type} account not found`,
        { cause: ErrorCode.E064 },
      );
    }
  }

  async getOne(iuser_id: Uuid): Promise<User> {
    try {
      const user = await this._userRepository.findOneByOrFail({
        _id: iuser_id,
      });
      return user;
    } catch {
      throw new NotFoundException('User Detail Not Found', {
        cause: ErrorCode.E065,
      });
    }
  }

  async getOneTeacherProfile(iuser_id: Uuid): Promise<TeacherProfile> {
    try {
      const teacherProfile =
        await this._teacherProfileRepository.findOneByOrFail({
          iuser_id,
        });
      return teacherProfile;
    } catch {
      throw new NotFoundException('Teacher Profile Not Found', {
        cause: ErrorCode.E066,
      });
    }
  }

  // async update(
  //   iuser_id: Uuid,
  //   updateUserReq: UpdateUserReq,
  // ): Promise<User> {
  //   try {
  //     const user = await this.getOne(iuser_id);

  //     const {
  //       first_name,
  //       last_name,
  //       profile_img_number,
  //     } = updateUserReq;

  //     user.profile_img =
  //       await this._utilityService.getFromMediaNumber(profile_img_number);
  //     if (profile_img_number != user.profile_img_number) {
  //       user.profile_img_number = profile_img_number;
  //     }
  //     user.user_name = user_name;

  //     user_info.first_name = first_name;
  //     user_info.last_name = last_name;
  //     user_info.gender = gender;
  //     user_info.nationality = nationality;
  //     user_info.birthday = new Date(birthday);
  //     const updated_user = await this._userRepository.save(user);
  //     const updated_user_info = await this._userInfoRepository.save(user_info);
  //     updated_user.user_info = updated_user_info;
  //     return updated_user;
  //   } catch (error) {
  //     if (
  //       error instanceof NotFoundException &&
  //       error.message == 'error_users_info_get_1'
  //     )
  //       throw new NotFoundException('error_user_info_update_1');
  //   }
  // }

  // delete(id: string) {
  //   return {};
  // }
}
