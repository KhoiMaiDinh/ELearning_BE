import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { PERMISSION } from '@/constants';
import { ApiAuth, CurrentUser, Permissions } from '@/decorators';
import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { PayoutQuery } from './dto/payout.query.dto';
import { PayoutRes } from './dto/payout.res.dto';
import { UpdatePayoutReq } from './dto/update-payout.req.dto';
import { PayoutService } from './services/payout.service';

@Controller({ path: 'payout', version: '1' })
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  @ApiAuth({
    summary: 'Get all payouts',
    isPaginated: true,
    type: PayoutRes,
    paginationType: 'offset',
  })
  @Permissions(PERMISSION.READ_PAYOUT)
  async find(@Query() query: PayoutQuery) {
    return await this.payoutService.find(query);
  }

  @Put(':id')
  @ApiAuth()
  @Permissions(PERMISSION.WRITE_PAYOUT)
  async update(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid,
    @Body() dto: UpdatePayoutReq,
  ) {
    return await this.payoutService.update(user, id, dto);
  }

  @Get('/me')
  @ApiAuth()
  async findByUser(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: PayoutQuery,
  ) {
    return await this.payoutService.findFromUser(user.id, query);
  }
}
