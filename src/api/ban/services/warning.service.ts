import { CouponService } from '@/api/coupon/coupon.service';
import { CouponType } from '@/api/coupon/enum/coupon-type.enum';
import { CourseRepository, CourseStatus } from '@/api/course';
import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { ReplyRepository } from '@/api/thread/repositories/reply.repository';
import { ThreadRepository } from '@/api/thread/repositories/thread.repository';
import { JwtPayloadType } from '@/api/token';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserRepository } from '@/api/user/user.repository';
import { IGiveCouponJob, Nanoid, Uuid } from '@/common';
import { JobName, QueueName } from '@/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { UserReportEntity } from '../entities/user-report.entity';
import { WarningEntity } from '../entities/warning.entity';
import { WarningType } from '../enum/warning-type.enum';
import { UserBanService } from './ban.service';

@Injectable()
export class WarningService {
  private readonly WARNING_LIMIT = 1;

  constructor(
    @InjectRepository(WarningEntity)
    private readonly warningRepo: Repository<WarningEntity>,
    private readonly userBanService: UserBanService,

    private readonly replyRepo: ReplyRepository,
    private readonly threadRepo: ThreadRepository,
    private readonly courseRepo: CourseRepository,
    private readonly lectureRepo: LectureRepository,
    private readonly userRepo: UserRepository,
    @InjectQueue(QueueName.EMAIL)
    private readonly emailQueue: Queue<IGiveCouponJob, any, string>,
    private readonly couponService: CouponService,
  ) {}

  async issueWarning(
    user_payload: JwtPayloadType,
    reported_user: UserEntity,
    report?: UserReportEntity,
  ): Promise<WarningEntity> {
    let course_id: Uuid | null;

    switch (report?.type) {
      case WarningType.REPLY: {
        await this.replyRepo.softDelete({ id: report.metadata.reply_id });
        break;
      }
      case WarningType.THREAD: {
        await this.threadRepo.softDelete({ id: report.metadata.thread_id });
        break;
      }
      case WarningType.COURSE: {
        const course = await this.courseRepo.findOne({
          where: { id: report.metadata.course_id },
        });
        course.status = CourseStatus.BANNED;
        await this.courseRepo.save(course);
        course_id = course.course_id;
        break;
      }
      case WarningType.COURSE_ITEM: {
        const lecture = await this.lectureRepo.findOne({
          where: { id: report.metadata.lecture_id },
          relations: {
            section: {
              course: { enrolled_users: { user: true } },
            },
            series: true,
          },
        });
        lecture.latestPublishedSeries.status = CourseStatus.BANNED;
        await this.lectureRepo.save(lecture);
        const course = lecture.section.course;
        await this.courseRepo.update(course.id, {
          status: CourseStatus.BANNED,
        });
        course_id = course.course_id;

        const ONE_YEAR_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 365;

        await Promise.all(
          course.enrolled_users.map(async (enroll) => {
            const coupon = await this.couponService.create(user_payload, {
              type: CouponType.PERCENTAGE,
              value: 100,
              starts_at: new Date(),
              expires_at: new Date(Date.now() + ONE_YEAR_IN_MILLISECONDS),
              usage_limit: 1,
              is_public: false,
            });
            await this.emailQueue.add(
              JobName.COUPON_GIFT,
              {
                email: enroll.user.email,
                coupon_code: coupon.code,
                reason:
                  'We recently reviewed your purchase and found that the course you enrolled in has violated our platform’s terms and conditions. We understand this may have caused inconvenience.',
              } as IGiveCouponJob,
              { attempts: 3, backoff: { type: 'exponential', delay: 60000 } },
            );
          }),
        );
        break;
      }
    }

    const warning = this.warningRepo.create({
      user: reported_user,
      report,
      course_id,
      is_resolved: false,
    });

    await this.warningRepo.save(warning);

    const active_warnings = await this.getActiveWarnings(reported_user.id);
    const filtered_warnings = active_warnings.filter(
      (warning) => warning.report?.type !== WarningType.COURSE,
    );

    if (filtered_warnings.length >= this.WARNING_LIMIT) {
      await this.userBanService.banUser(reported_user, filtered_warnings);
    }

    return warning;
  }

  async getActiveWarnings(user_id: Nanoid): Promise<WarningEntity[]> {
    return await this.warningRepo.find({
      where: { user: { id: user_id }, ban: null },
      relations: { user: true, report: true },
    });
  }

  async resolveCourseWarning(course_id: Uuid): Promise<void> {
    await this.warningRepo.update(
      { course_id },
      {
        is_resolved: true,
        resolved_at: new Date(),
      },
    );
  }
}
