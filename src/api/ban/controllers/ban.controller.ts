import { Nanoid } from '@/common';
import { ApiAuth } from '@/decorators';
import { Controller, HttpStatus, Param, Patch } from '@nestjs/common';
import { UserBanService } from '../services/ban.service';

@Controller({ path: 'bans', version: '1' })
export class BanController {
  constructor(private readonly banService: UserBanService) {}

  @ApiAuth({
    summary: 'unban user by id',
    statusCode: HttpStatus.OK,
  })
  @Patch(':user_id/unban')
  async unbanUser(@Param('user_id') user_id: Nanoid) {
    return await this.banService.unbanUser(user_id);
  }
}
