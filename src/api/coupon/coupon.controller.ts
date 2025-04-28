import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { Permission } from '@/constants';
import { ApiAuth, CurrentUser, Permissions } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponRes, CreateCouponReq, UpdateCouponReq } from './dto';

@Controller({ path: 'coupons', version: '1' })
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiAuth({
    type: CouponRes,
    summary: 'Create a new coupon',
    statusCode: HttpStatus.CREATED,
  })
  async create(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateCouponReq,
  ) {
    const coupon = await this.couponService.create(user, dto);
    return coupon.toDto(CouponRes);
  }

  @ApiAuth({
    type: CouponRes,
    summary: 'Get coupon by code',
    statusCode: HttpStatus.OK,
  })
  @Get(':code')
  async getCouponByCode(@Param('code') code: Nanoid) {
    const coupon = await this.couponService.findByCode(code);
    return coupon.toDto(CouponRes);
  }

  @ApiAuth({
    type: null,
    summary: 'Toggle coupon activation status',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Permissions(Permission.WRITE_COUPON)
  @Post(':code/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  async toggleCouponStatus(@Param('code') code: Nanoid): Promise<void> {
    await this.couponService.toggleStatus(code);
  }

  @ApiAuth({
    type: CouponRes,
    summary: 'Update coupon details before it becomes active',
    statusCode: HttpStatus.OK,
  })
  @Put(':code')
  async update(
    @Param('code') code: Nanoid,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: Partial<UpdateCouponReq>,
  ): Promise<CouponRes> {
    return this.couponService.update(code, user, dto);
  }

  @Delete(':code')
  @ApiAuth({
    type: null,
    summary: 'Delete a coupon',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCoupon(
    @Param('code') code: Nanoid,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<void> {
    await this.couponService.delete(code, user);
  }
}
