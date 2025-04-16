import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';

import {
  CursorPaginatedDto,
  CursorPaginationDto,
  Nanoid,
  Uuid,
} from '@/common';
import { ErrorCode as EC, Permission } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { buildPaginator } from '@/utils';

import { CourseEntity } from '@/api/course/entities/course.entity';
import { CourseStatus } from '@/api/course/enums/course-status.enum';
import { EnrollCourseService } from '@/api/course/services/enroll-course.service';
import { CreateOrderRes, LoadOrderReq, OrderRes } from '@/api/order/dto';
import { OrderDetailEntity } from '@/api/order/entities/order-detail.entity';
import { OrderEntity } from '@/api/order/entities/order.entity';
import { PaymentProvider } from '@/api/payment/enums/payment-provider.enum';
import { PaymentStatus } from '@/api/payment/enums/payment-status.enum';
import { PaymentService } from '@/api/payment/services/payment.service';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';

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

    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,

    private readonly enrollCourseService: EnrollCourseService,
  ) {}

  async order(
    ex_user_id: Nanoid,
    ex_course_ids: Nanoid[],
    client_ip: string,
  ): Promise<CreateOrderRes> {
    const user = await this.userRepo.findOne({ where: { id: ex_user_id } });
    if (!user) throw new NotFoundException(EC.E002);

    const courses = await this.courseRepo.find({
      where: { id: In(ex_course_ids) },
      relations: ['thumbnail'],
    });
    await this.validateCourses(user.user_id, courses);

    const { total_amount, details } = this.prepareOrderDetails(courses);

    const order = this.orderRepo.create({
      user,
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.VNPAY,
      amount: total_amount,
      currency: 'vnd',
      details,
    });

    await this.orderRepo.save(order);

    const payment_url = await this.paymentService.initPaymentRequest(
      courses,
      order.id,
      user.email,
    );
    return plainToInstance(CreateOrderRes, {
      order,
      payment: { vnp_url: payment_url },
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

    order.status = PaymentStatus.SUCCESS;
    order.payment_completed_at = new Date();
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
    user_id: Uuid,
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
        if (is_enrolled)
          throw new ValidationException(
            EC.E047,
            `User already enrolled in course ${course.id}`,
          );
      }),
    );
  }

  private prepareOrderDetails(courses: CourseEntity[]): {
    total_amount: number;
    details: OrderDetailEntity[];
  } {
    let total_amount = 0;

    const details = courses.map((course) => {
      const price = course.price;
      const discount = 0;
      const final_price = price - discount;

      total_amount += final_price;

      return this.orderDetailRepo.create({
        course_id: course.course_id,
        price,
        discount,
        final_price,
      });
    });

    return { total_amount: total_amount, details };
  }
}
