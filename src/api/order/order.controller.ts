import { CursorPaginatedDto, Nanoid } from '@/common';
import { Permission } from '@/constants';
import { ApiAuth, CurrentUser, Permissions } from '@/decorators';
import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayloadType } from '../token';
import { CreateOrderReq } from './dto/create-order.req.dto';
import { CreateOrderRes } from './dto/create-order.res.dto';
import { LoadOrderQuery } from './dto/load-order.req.dto';
import { OrderRes } from './dto/order.res.dto';
import { OrderService } from './services/order.service';

@Controller({ path: 'orders', version: '1' })
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiAuth({
    summary: 'Create payment url',
  })
  async order(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateOrderReq,
    @Req() req: Request,
  ): Promise<CreateOrderRes> {
    const client_ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress;

    const result = await this.orderService.order(user.id, client_ip, dto);

    return result;
  }

  @Get()
  @ApiAuth({
    type: OrderRes,
    summary: 'Load more order',
    isPaginated: true,
    paginationType: 'offset',
  })
  @Permissions(Permission.READ_ORDER)
  async findOrders(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: LoadOrderQuery,
  ): Promise<CursorPaginatedDto<OrderRes>> {
    return await this.orderService.findByOffset(user, query);
  }

  @Get('me')
  @ApiAuth({
    type: OrderRes,
    summary: 'Load more order of user',
  })
  async getOrderList(@CurrentUser() user: JwtPayloadType): Promise<OrderRes[]> {
    return await this.orderService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiAuth({
    summary: 'Get order detail',
  })
  async getOrderDetail(
    @CurrentUser() user: JwtPayloadType,
    @Param('id') id: Nanoid,
  ) {
    const result = await this.orderService.findOne(user, id);
    return result;
  }
}
