import { CouponService } from '@/api/coupon/coupon.service';
import { CouponType } from '@/api/coupon/enum/coupon-type.enum';
import { CourseRepository, CourseStatus } from '@/api/course';
import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { ReplyRepository } from '@/api/thread/repositories/reply.repository';
import { ThreadRepository } from '@/api/thread/repositories/thread.repository';
import { JwtPayloadType } from '@/api/token';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserRepository } from '@/api/user/user.repository';
import { IGiveCouponJob, Nanoid } from '@/common';
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
    const warning = this.warningRepo.create({
      user: reported_user,
      report,
    });
    await this.warningRepo.save(warning);
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
        await this.courseRepo.update(
          { id: report.metadata.course_id },
          { status: CourseStatus.BANNED },
        );
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
        await this.courseRepo.update(
          { id: lecture.section.course.id },
          { status: CourseStatus.BANNED },
        );
        const ONE_YEAR_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 365;
        // notify course user
        await Promise.all(
          lecture.section.course.enrolled_users.map(async (enroll) => {
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
    const active_warnings = await this.getActiveWarnings(reported_user.id);
    console.log(active_warnings);
    if (active_warnings.length >= this.WARNING_LIMIT)
      await this.userBanService.banUser(reported_user, active_warnings);

    return warning;
  }

  async getActiveWarnings(user_id: Nanoid): Promise<WarningEntity[]> {
    return await this.warningRepo.find({
      where: { user: { id: user_id }, ban: null },
      relations: { user: true, report: true },
    });
  }
}
