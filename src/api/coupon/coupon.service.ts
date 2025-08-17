import { Injectable } from '@nestjs/common';
import { Between, In, MoreThan } from 'typeorm';

import { CourseService } from '@/api/course/services/course.service';
import { OrderDetailRepository } from '@/api/order/repositories/order-detail.repository';
import { PaymentStatus } from '@/api/payment/enums/payment-status.enum';
import { JwtPayloadType } from '@/api/token';
import { Nanoid, OffsetPaginationDto, Uuid } from '@/common';
import { ENTITY, ErrorCode, Order, PERMISSION } from '@/constants';
import {
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from '@/exceptions';

import { CouponQuery, CouponsQuery, CreateCouponReq } from '@/api/coupon/dto';
import { CouponEntity } from '@/api/coupon/entities/coupon.entity';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { rawPaginate } from '@/utils/offset-pagination-raw';
import { CourseEntity } from '../course/entities/course.entity';
import { FavoriteCourseService } from '../course/services/favorite-course.service';
import { InstructorRepository } from '../instructor';
import { NotificationType } from '../notification/enum/notification-type.enum';
import { NotificationBuilderService } from '../notification/notification-builder.service';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { CouponRepository } from './coupon.repository';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepo: CouponRepository,
    private readonly orderDetailRepo: OrderDetailRepository,
    private readonly courseService: CourseService,
    private readonly instructorRepo: InstructorRepository,
    private readonly favoriteCourseService: FavoriteCourseService,
    private readonly userService: UserService,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(
    user: JwtPayloadType,
    dto: CreateCouponReq,
  ): Promise<CouponEntity> {
    let course: CourseEntity = null;
    if (user.permissions.includes(PERMISSION.WRITE_COUPON)) {
      if (dto.course) {
        course = await this.courseService.findOne(dto.course.id);
        if (!course.published_at) throw new ValidationException(ErrorCode.E083);
      }
    } else {
      if (!dto.course) return;

      course = await this.courseService.findOne(dto.course.id);
      this.courseService.ensureOwnership(course, user.id);
      // await this.validateCourseCouponLimit(course.course_id);
    }

    if (dto.is_public && course != null) {
      await this.validateOverlapping(
        course.course_id,
        dto.starts_at,
        dto.expires_at,
      );
    }

    if (dto.code) await this.validateCode(dto.code);

    const coupon = this.couponRepo.create({
      code: dto?.code,
      type: dto.type,
      value: dto.value,
      starts_at: dto.starts_at,
      expires_at: dto?.expires_at,
      usage_limit: dto.usage_limit,
      is_active: true,
      is_public: dto.is_public,
      course: course,
      createdBy: user.id,
    });

    if (course != null) {
      await this.sendCouponForCourseNotification(coupon);
    }
    return this.couponRepo.save(coupon);
  }

  async update(
    code: Nanoid,
    user: JwtPayloadType,
    dto: Partial<CreateCouponReq>,
  ): Promise<CouponEntity> {
    const coupon = await this.couponRepo.findOne({
      where: { code },
    });
    if (!coupon) throw new NotFoundException(ErrorCode.E065);

    const now = new Date();

    if (coupon.starts_at <= now) throw new ValidationException(ErrorCode.E069);

    if (
      coupon.createdBy !== user.id &&
      !user.permissions.includes(PERMISSION.WRITE_COUPON)
    ) {
      throw new ForbiddenException(
        ErrorCode.F002,
        'You are not allowed to update this coupon',
      );
    }

    if (dto.is_public && coupon?.course_id) {
      await this.validateOverlapping(
        coupon.course_id,
        dto.starts_at,
        dto.expires_at,
      );
    }

    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon);
  }

  async delete(code: Nanoid, user: JwtPayloadType): Promise<void> {
    const coupon = await this.couponRepo.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException(ErrorCode.E065);

    const now = new Date();
    if (coupon.starts_at <= now) throw new ValidationException(ErrorCode.E069);

    if (
      coupon.createdBy !== user.id &&
      !user.permissions.includes(PERMISSION.WRITE_COUPON)
    ) {
      throw new ForbiddenException(
        ErrorCode.F002,
        'You are not allowed to update this coupon',
      );
    }

    await this.couponRepo.softDelete({ code });
  }

  async findFromCourse(user: JwtPayloadType, course_id: Nanoid) {
    const course = await this.courseService.findOne(course_id, {
      with_instructor: true,
    });
    // const is_course_owner = course.instructor.user.id == user.id;
    // const has_permission = user.permissions.includes(PERMISSION.READ_COUPON);
    // if (!(is_course_owner || has_permission)) {
    //   throw new ForbiddenException(
    //     ErrorCode.F002,
    //     'Bạn không có quyền truy cập danh sách mã khuyễn mãi của khóa học này',
    //   );
    // }

    const { coupons } = await this.find(
      {
        limit: 100,
        offset: 0,
        order: Order.DESC,
        is_active: true,
        is_public: true,
      },
      {
        course_id: course.course_id,
      },
    );
    return {
      coupons,
    };
  }

  async findFromInstructor(user: JwtPayloadType, filter: CouponsQuery) {
    const instructor = await this.instructorRepo.findOneByUserPublicId(user.id);
    return await this.find(filter, { instructor_id: instructor.instructor_id });
  }

  async find(
    filters: CouponsQuery,
    options?: { instructor_id?: Uuid; course_id?: Uuid },
  ): Promise<{ coupons: CouponEntity[]; metadata: OffsetPaginationDto }> {
    const query = this.couponRepo.createQueryBuilder('coupon');
    query.leftJoinAndSelect('coupon.course', 'course');
    query
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoin('coupon.order_details', 'order_details')
      .leftJoin(
        'order_details.order',
        'ord',
        'ord.payment_status = :payment_status',
        {
          payment_status: PaymentStatus.SUCCESS,
        },
      )
      .leftJoin('user', 'creator', 'creator.id = coupon.createdBy')
      .leftJoin('user_roles_role', 'ur', 'ur.userUserId = creator.user_id')
      .leftJoin('role', 'role', 'role.role_id = ur.roleRoleId')
      .addSelect('COUNT(ord.order_id)', 'coupon_usage_count')
      .addSelect([
        'creator.username AS creator_username',
        'array_agg(role.role_name) AS creator_roles',
      ])
      .addSelect(
        'SUM(order_details.final_price)::float',
        'coupon_total_revenue',
      )
      .groupBy('coupon.coupon_id')
      .addGroupBy('course.course_id')
      .addGroupBy('instructor.instructor_id')
      .addGroupBy('creator.user_id');

    if (options?.course_id) {
      query.andWhere('course.course_id = :course_id', {
        course_id: options.course_id,
      });
    }

    if (filters.is_active !== undefined) {
      query.andWhere('coupon.is_active = :is_active', {
        is_active: filters.is_active,
      });
    }

    if (filters.q) {
      query.andWhere(`(coupon.code ILIKE :q OR course.title ILIKE :q)`, {
        q: `%${filters.q}%`,
      });
    }

    if (filters.from) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM user_roles_role ur2
          JOIN role r2 ON r2.role_id = ur2."roleRoleId"
          WHERE ur2."userUserId" = creator.user_id AND r2.role_name = :role_name
        )`,
        { role_name: filters.from },
      );
    }

    if (filters.is_public !== undefined) {
      query.andWhere('coupon.is_public = :is_public', {
        is_public: filters.is_public,
      });
    }

    if (filters.status) {
      switch (filters.status) {
        case 'EXPIRED':
          query.andWhere('coupon.expires_at < NOW()');
          break;
        case 'VALID_NOW':
          query.andWhere(
            'coupon.starts_at <= NOW() AND coupon.expires_at >= NOW()',
          );
          break;
        case 'NOT_STARTED':
          query.andWhere('coupon.starts_at > NOW()');
          break;
      }
    }

    if (filters.usage_exceeded !== undefined) {
      query.andWhere(
        `
          (
            coupon.usage_limit IS NOT NULL AND
            (
              SELECT COUNT(*) FROM "${ENTITY.ORDER_DETAIL}" od 
              WHERE od.coupon_id = coupon.coupon_id
            ) >= coupon.usage_limit
          ) = :exceeded
        `,
        { exceeded: filters.usage_exceeded ? 1 : 0 },
      );
    }

    if (options?.instructor_id) {
      query.andWhere('instructor.instructor_id = :instructor_id', {
        instructor_id: options.instructor_id,
      });
    }

    query.orderBy('coupon.createdAt', filters.order);

    const [result, metadata] = await rawPaginate<CouponEntity>(query, filters, {
      skipCount: false,
      takeAll: false,
    });

    const coupons = result.entities.map((coupon, index) => {
      return {
        ...coupon,
        creator_roles: result.raw[index].creator_roles,
        creator_username: result.raw[index].creator_username,
      };
    });
    return {
      coupons: coupons.map((coupon) =>
        Object.assign(new CouponEntity(), coupon),
      ),
      metadata,
    };
  }

  async findByCode(
    code: Nanoid,
    query: CouponQuery = {},
  ): Promise<CouponEntity> {
    const now = new Date();
    const coupon = await this.couponRepo.findOne({
      where: {
        code,
        // starts_at: LessThanOrEqual(now),
        // expires_at: MoreThanOrEqual(now),
      },
      relations: {
        course: true,
      },
    });
    if (!coupon) throw new NotFoundException(ErrorCode.E065);
    if (query.check_usability) await this.validateUsability(coupon);
    return coupon;
  }

  async findMostValuablePublicOne(): Promise<CouponEntity> {
    const coupon = await this.couponRepo
      .createQueryBuilder('coupon')
      .where('coupon.is_public = TRUE')
      .andWhere('coupon.course_id IS NULL')
      .andWhere('coupon.is_active = TRUE')
      .andWhere('coupon.starts_at <= NOW()')
      .andWhere('(coupon.expires_at IS NULL OR coupon.expires_at >= NOW())')
      .orderBy('coupon.value', 'DESC')
      .getOne();

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

  async toggleStatus(code: Nanoid): Promise<void> {
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

  private async validateCode(code: Nanoid): Promise<void> {
    const coupon = await this.couponRepo.findOne({
      where: { code, expires_at: MoreThan(new Date()) },
    });
    if (coupon) throw new ValidationException(ErrorCode.E082);
  }

  private async validateOverlapping(
    course_id: Uuid,
    starts_at: Date,
    expires_at: Date,
  ): Promise<void> {
    const overlappingCoupon = await this.couponRepo
      .createQueryBuilder('coupon')
      .where('coupon.course_id = :course_id', { course_id })
      .andWhere('coupon.is_public = TRUE')
      .andWhere('coupon.is_active = TRUE')
      .andWhere(
        `(
        (coupon.starts_at <= :expiresAt AND coupon.expires_at >= :startsAt)
      )`,
        {
          startsAt: starts_at,
          expiresAt: expires_at,
        },
      )
      .getOne();

    if (overlappingCoupon) {
      throw new ForbiddenException(ErrorCode.E081);
    }
  }

  private async sendCouponForCourseNotification(coupon: CouponEntity) {
    const favorited_users = await this.favoriteCourseService.findUsers(
      coupon.course_id,
    );

    const built_notification = this.notificationBuilder.couponForCourse(coupon);
    for (const user of favorited_users) {
      const notification = await this.notificationService.save(
        user.user_id,
        NotificationType.COUPON_FOR_COURSE,
        {
          coupon_code: coupon.code,
        },
        built_notification,
      );
      this.notificationGateway.emitToUser(user.id, {
        ...notification,
        ...built_notification,
      });
    }
  }
}
