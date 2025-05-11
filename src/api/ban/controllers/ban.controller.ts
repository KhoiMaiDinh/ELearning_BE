import { Nanoid, SuccessBasicDto } from '@/common';
import { Permission } from '@/constants';
import { ApiAuth, Permissions } from '@/decorators';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { BanQuery, BanRes } from '../dto';
import { UserBanService } from '../services/ban.service';

@Controller({ path: 'bans', version: '1' })
export class BanController {
  constructor(private readonly banService: UserBanService) {}

  @ApiAuth({
    summary: 'Get banned users',
    statusCode: HttpStatus.OK,
    isPaginated: true,
    paginationType: 'offset',
    type: BanRes,
  })
  @Get()
  @Permissions(Permission.READ_BAN)
  async getBannedUsers(@Query() query: BanQuery) {
    return await this.banService.find(query);
  }

  @ApiAuth({
    summary: 'unban user by id',
    statusCode: HttpStatus.OK,
  })
  @Patch(':user_id/unban')
  @Permissions(Permission.WRITE_BAN)
  async unbanUser(@Param('user_id') user_id: Nanoid): Promise<SuccessBasicDto> {
    await this.banService.unbanUser(user_id);
    return {
      message: 'User has been unbanned',
      status_code: HttpStatus.OK,
    };
  }
}
