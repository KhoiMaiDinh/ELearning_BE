import {
  Controller,
  Get,
  Body,
  Delete,
  HttpStatus,
  HttpCode,
  Headers,
  Put,
  HttpException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UserService } from '../services/user.service';
import { ErrorCode, Uuid } from '@app/common';
import { GetUserResDto } from '../dto';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';

@Controller({ path: 'me', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async getOne(@CurrentUser() customer_id: Uuid): Promise<GetUserResDto> {
  //   try {
  //     const user = await this.userService.getOne(customer_id);
  //     return plainToInstance(GetUserResDto, {
  //       status_code: 200,
  //       message: 'success_user_get_detail_1',
  //       data: user,
  //     });
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       if (
  //         error.cause == ErrorCode.E065 // User Detail Not Found
  //       )
  //         throw error;
  //     }
  //     throw new Error(error.message);
  //   }
  // }

  // @Get('user-infos')
  // @HttpCode(HttpStatus.OK)
  // async getOneInfo(
  //   @CurrentUser() customer_id: Uuid,
  // ): Promise<GetUserInfoResDto> {
  //   try {
  //     const userInfo = await this.userService.getOneInfo(customer_id);
  //     return plainToInstance(GetUserInfoResDto, {
  //       status_code: 200,
  //       message: 'success_users_info_get_1',
  //       data: userInfo,
  //     });
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       if (
  //         error.cause == ErrorCode.E066 // User Info Not Found
  //       )
  //         throw error;
  //     }
  //     throw new Error(error.message);
  //   }
  // }

  // @Put('user-infos')
  // @HttpCode(HttpStatus.OK)
  // async update(
  //   @Headers('X-Customer-ID') customer_id: Uuid,
  //   @Body() updateUserInfoReqDto: UpdateUserInfoReqDto,
  // ): Promise<UpdateUserInfoResDto> {
  //   try {
  //     const user_info = await this.userService.update(
  //       customer_id,
  //       updateUserInfoReqDto,
  //     );
  //     return plainToInstance(UpdateUserInfoResDto, {
  //       status_code: 200,
  //       message: 'success_users_update_1',
  //       data: user_info,
  //     });
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       if (
  //         error.cause == ErrorCode.E066 // User Info Not Found
  //       )
  //         throw error;
  //     }
  //     throw new Error(error.message);
  //   }
  // }

  // @Delete()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove() {
  //   const id = ''; // from token
  //   this.userService.delete(id);
  //   return {
  //     status_code: 204,
  //     message: 'success_users_delete_1',
  //     data: {},
  //   };
  // }
}
