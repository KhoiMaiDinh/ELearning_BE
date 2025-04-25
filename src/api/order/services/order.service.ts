import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';

import { CursorPaginatedDto, CursorPaginationDto, Nanoid } from '@/common';
import { ErrorCode as EC, JobName, Permission, QueueName } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { buildPaginator } from '@/utils';

import { CouponService } from '@/api/coupon/coupon.service';
import { CouponEntity } from '@/api/coupon/entities/coupon.entity';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { CourseStatus } from '@/api/course/enums/course-status.enum';
import { EnrollCourseService } from '@/api/course/services/enroll-course.service';
import {
  CreateOrderReq,
  CreateOrderRes,
  LoadOrderReq,
  OrderRes,
} from '@/api/order/dto';
import { OrderDetailEntity } from '@/api/order/entities/order-detail.entity';
import { OrderEntity } from '@/api/order/entities/order.entity';
import { PaymentProvider } from '@/api/payment/enums/payment-provider.enum';
import { PaymentStatus } from '@/api/payment/enums/payment-status.enum';
import { VnpayPaymentService } from '@/api/payment/services/vnpay-payment.service';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,

    @InjectRepository(OrderDetailEntity)
    private readonly orderDetailRepo: Repository<OrderDetailEntity>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,

    private readonly userRepo: UserRepository,

    private readonly paymentService: VnpayPaymentService,

    private readonly enrollCourseService: EnrollCourseService,

    @InjectQueue(QueueName.ORDER)
    private readonly orderQueue: Queue,

    private readonly couponService: CouponService,
  ) {}

  async order(
    user_id: Nanoid,
    client_ip: string,
    dto: CreateOrderReq,
  ): Promise<CreateOrderRes> {
    const user = await this.userRepo.findOne({ where: { id: user_id } });
    if (!user) throw new NotFoundException(EC.E002);

    const courses = await this.courseRepo.find({
      where: { id: In(dto.course_ids) },
      relations: { thumbnail: true, instructor: { user: true } },
    });
    await this.validateCourses(user.id, courses);

    let coupon: CouponEntity = null;
    if (dto.coupon_code)
      coupon = await this.couponService.findByCode(dto.coupon_code, {
        check_usability: true,
      });

    const { total_amount, details } = this.prepareOrderDetails(courses, coupon);

    const five_min_ms = 5 * 60 * 1000;
    const expired_at_ms = Date.now() + five_min_ms;
    const expired_at = new Date(expired_at_ms);

    const order = this.orderRepo.create({
      user,
      payment_status: PaymentStatus.PENDING,
      provider: PaymentProvider.VNPAY,
      total_amount: total_amount,
      currency: 'vnd',
      details,
      expired_at,
    });

    await this.orderRepo.save(order);

    const payment_url = this.paymentService.initRequest(
      order.id,
      total_amount,
      client_ip,
      expired_at,
    );

    await this.orderQueue.add(
      JobName.HANDLE_ORDER_EXPIRATION,
      {
        order_id: order.id,
      },
      { delay: five_min_ms, removeOnComplete: true },
    );

    return plainToInstance(CreateOrderRes, {
      order,
      payment: { payment_url },
    });
  }

  async markOrderAsPaid(id: Nanoid) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['details', 'user'],
    });
    if (!order) throw new NotFoundException(EC.E045);

    await Promise.all(
      order.details.map(async (detail) =>
        this.enrollCourseService.enrollCourse(
          detail.course_id,
          order.user.user_id,
        ),
      ),
    );

    const payout_due_at = new Date();
    order.payment_status = PaymentStatus.SUCCESS;
    order.details.forEach((detail) => {
      detail.payout_due_at = payout_due_at;
    });
    await this.orderRepo.save(order);
  }

  async handleExpiration(id: Nanoid) {
    const order = await this.orderRepo.findOne({
      where: { id },
    });
    if (
      !(
        order.payment_status == PaymentStatus.SUCCESS ||
        order.payment_status == PaymentStatus.FAILED
      )
    )
      order.payment_status = PaymentStatus.EXPIRED;

    await this.orderRepo.save(order);
  }

  async findOne(user: JwtPayloadType, id: Nanoid): Promise<OrderRes> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['details', 'user', 'details.course'],
    });

    if (!order) throw new NotFoundException(EC.E045);
    if (
      order.user.id !== user.id &&
      !user.permissions.includes(Permission.READ_ORDER)
    )
      throw new ValidationException(EC.F002);
    return order.toDto(OrderRes);
  }

  async findAllByUser(user_id: Nanoid): Promise<OrderRes[]> {
    const user = await this.userRepo.findOne({ where: { id: user_id } });
    if (!user) throw new NotFoundException(EC.E002);

    const orders = await this.orderRepo.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      relations: ['details'],
    });

    return plainToInstance(OrderRes, orders);
  }

  async loadMoreOrders(
    user: JwtPayloadType,
    reqDto: LoadOrderReq,
  ): Promise<CursorPaginatedDto<OrderRes>> {
    const queryBuilder = this.orderRepo.createQueryBuilder('user');
    const paginator = buildPaginator({
      entity: OrderEntity,
      alias: 'order',
      paginationKeys: ['createdAt'],
      query: {
        limit: reqDto.limit,
        order: 'DESC',
        afterCursor: reqDto.afterCursor,
        beforeCursor: reqDto.beforeCursor,
      },
    });

    const { data, cursor } = await paginator.paginate(queryBuilder);

    const metaDto = new CursorPaginationDto(
      data.length,
      cursor.afterCursor,
      cursor.beforeCursor,
      reqDto,
    );

    return new CursorPaginatedDto(plainToInstance(OrderRes, data), metaDto);
  }

  private async validateCourses(
    user_id: Nanoid,
    courses: CourseEntity[],
  ): Promise<void> {
    if (!courses.length)
      throw new NotFoundException(EC.E025, 'One of courses not found');

    await Promise.all(
      courses.map(async (course) => {
        if (course.status !== CourseStatus.PUBLISHED)
          throw new NotFoundException(EC.E044);
        const is_enrolled = await this.enrollCourseService.isEnrolled(
          course.course_id,
          user_id,
        );
        if (user_id == course.instructor.user.id)
          throw new ValidationException(EC.E072);
        if (is_enrolled)
          throw new ValidationException(
            EC.E047,
            `User already enrolled in course ${course.id}`,
          );
      }),
    );
  }

  private prepareOrderDetails(
    courses: CourseEntity[],
    coupon: CouponEntity = null,
  ): {
    total_amount: number;
    details: OrderDetailEntity[];
  } {
    let total_amount = 0;
    let is_coupon_applied = false;

    const details = courses.map((course) => {
      const price = course.price;
      let discount = 0;

      if (
        coupon &&
        (coupon.course_id == course.course_id || coupon.course_id == null)
      ) {
        is_coupon_applied = true;
        discount = Math.round((price * coupon.value) / 100);
      }

      const final_price = price - discount;
      const platform_fee = Math.round(final_price * 0.1);

      total_amount += final_price;

      return this.orderDetailRepo.create({
        course_id: course.course_id,
        price,
        discount,
        final_price,
        platform_fee,
        // payout_status: PaymentStatus.PENDING,
      });
    });

    if (!is_coupon_applied && coupon != null)
      throw new ValidationException(EC.E070);

    return { total_amount: total_amount, details };
  }

  async updatePaymentStatus(
    order_id: Nanoid,
    payment_status: PaymentStatus,
  ): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: order_id },
      relations: ['details'],
    });
    if (!order) throw new NotFoundException(EC.E045);

    order.payment_status = payment_status;
    await this.orderRepo.save(order);
  }
}
