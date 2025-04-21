import { Nanoid } from '@/common';
import { Permission } from '@/constants';
import { ApiAuth, Permissions } from '@/decorators';
import { Body, Controller, Get, Put, Query } from '@nestjs/common';
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
  })
  @Permissions(Permission.READ_PAYOUT)
  async find(@Query() query: PayoutQuery) {
    return await this.payoutService.find(query);
  }

  @Put(':id')
  @ApiAuth()
  @Permissions(Permission.WRITE_PAYOUT)
  async update(@Query('id') id: Nanoid, @Body() dto: UpdatePayoutReq) {
    return await this.payoutService.update(id, dto);
  }
}
