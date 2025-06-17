import { JwtPayloadType } from '@/api/token';
import { Nanoid, OffsetPaginatedDto } from '@/common';
import { PERMISSION } from '@/constants';
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
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CouponService } from './coupon.service';
import {
  CouponRes,
  CouponsQuery,
  CreateCouponReq,
  UpdateCouponReq,
} from './dto';

@Controller({ path: 'coupons', version: '1' })
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get('me')
  @ApiAuth({
    type: CouponRes,
    summary: 'Get all coupons for current user',
    statusCode: HttpStatus.OK,
  })
  async getAllCouponsForCurrentUser(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: CouponsQuery,
  ) {
    const { coupons, metadata } = await this.couponService.findFromInstructor(
      user,
      query,
    );
    return new OffsetPaginatedDto(
      plainToInstance(CouponRes, coupons),
      metadata,
    );
  }

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
  @Permissions(PERMISSION.WRITE_COUPON)
  @Put(':code/toggle')
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
    @Body() body: Partial<UpdateCouponReq>,
  ): Promise<CouponRes> {
    const coupon = await this.couponService.update(code, user, body);
    return coupon.toDto(CouponRes);
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

  @Get()
  @ApiAuth({
    type: CouponRes,
    summary: 'Get all coupons',
    statusCode: HttpStatus.OK,
  })
  async getAllCoupons(@Query() query: CouponsQuery) {
    const { coupons, metadata } = await this.couponService.find(query);
    return new OffsetPaginatedDto(
      plainToInstance(CouponRes, coupons),
      metadata,
    );
  }
}
