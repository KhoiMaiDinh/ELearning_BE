import { CouponQuery, CreateCouponReq } from '@/api/coupon/dto';
import { CouponEntity } from '@/api/coupon/entities/coupon.entity';
import { JwtPayloadType } from '@/api/token';
import { Uuid } from '@/common';
import { ErrorCode, Permission } from '@/constants';
import {
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CourseService } from '../course/services/course.service';
import { OrderDetailEntity } from '../order/entities/order-detail.entity';
import { PaymentStatus } from '../payment/enums/payment-status.enum';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,
    @InjectRepository(OrderDetailEntity)
    private readonly orderDetailRepo: Repository<OrderDetailEntity>,
    private readonly courseService: CourseService,
  ) {}

  async create(
    user: JwtPayloadType,
    dto: CreateCouponReq,
  ): Promise<CouponEntity> {
    let course_id: Uuid = null;
    if (!user.permissions.includes(Permission.WRITE_COUPON)) {
      if (!dto.course) throw new ForbiddenException(ErrorCode.E062);

      const course = await this.courseService.findOne(dto.course.id);
      this.courseService.ensureOwnership(course, user.id);
      await this.validateCourseCouponLimit(course.course_id);
      course_id = course.course_id;
    }

    const coupon = this.couponRepo.create({
      type: dto.type,
      value: dto.value,
      starts_at: dto.starts_at,
      expires_at: dto.expires_at,
      usage_limit: dto.usage_limit,
      is_active: true,
      coupon_id: course_id,
      createdBy: user.id,
    });
    return this.couponRepo.save(coupon);
  }

  async update(
    code: string,
    user: JwtPayloadType,
    dto: Partial<CreateCouponReq>,
  ): Promise<CouponEntity> {
    const coupon = await this.couponRepo.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException(ErrorCode.E065);

    const now = new Date();

    if (coupon.starts_at <= now) throw new ValidationException(ErrorCode.E069);

    if (
      coupon.createdBy !== user.id &&
      !user.permissions.includes(Permission.WRITE_COUPON)
    ) {
      throw new ForbiddenException(
        ErrorCode.F002,
        'You are not allowed to update this coupon',
      );
    }

    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon);
  }

  async delete(code: string, user: JwtPayloadType): Promise<void> {
    const coupon = await this.couponRepo.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException(ErrorCode.E065);

    const now = new Date();
    if (coupon.starts_at <= now) throw new ValidationException(ErrorCode.E069);

    if (
      coupon.createdBy !== user.id &&
      !user.permissions.includes(Permission.WRITE_COUPON)
    ) {
      throw new ForbiddenException(
        ErrorCode.F002,
        'You are not allowed to update this coupon',
      );
    }

    await this.couponRepo.softDelete({ code });
  }

  async findByCode(
    code: string,
    query: CouponQuery = {},
  ): Promise<CouponEntity> {
    const now = new Date();
    const coupon = await this.couponRepo.findOne({
      where: {
        code,
        is_active: true,
        starts_at: LessThanOrEqual(now),
        expires_at: MoreThanOrEqual(now),
      },
    });
    if (!coupon) throw new NotFoundException(ErrorCode.E065);
    if (query.check_usability) await this.validateUsability(coupon);
    return coupon;
  }

  async validateUsability(coupon: CouponEntity): Promise<void> {
    const now = new Date();

    if (!coupon.is_active) throw new ValidationException(ErrorCode.E066);
    if (coupon.expires_at < now) throw new ValidationException(ErrorCode.E067);
    if (coupon.starts_at > now) throw new ValidationException(ErrorCode.E068);

    if (coupon.usage_limit) {
      const usage_count = await this.orderDetailRepo.count({
        where: {
          coupon_id: coupon.coupon_id,
          order: {
            payment_status: In([PaymentStatus.PENDING, PaymentStatus.SUCCESS]),
          },
        },
        relations: { order: true },
      });
      if (usage_count >= coupon.usage_limit)
        throw new ValidationException(ErrorCode.E064);
    }
  }

  async toggleStatus(code: string): Promise<void> {
    const coupon = await this.couponRepo.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException(ErrorCode.E065);

    coupon.is_active = !coupon.is_active;
    await this.couponRepo.save(coupon);
  }

  private async validateCourseCouponLimit(course_id: Uuid): Promise<void> {
    const now = new Date();
    const start_of_month = new Date(now.getFullYear(), now.getMonth(), 1);
    const end_of_month = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const count = await this.couponRepo.count({
      where: {
        course_id,
        createdAt: Between(start_of_month, end_of_month),
      },
    });

    if (count > 2) {
      throw new ValidationException(ErrorCode.E063);
    }
  }
}
