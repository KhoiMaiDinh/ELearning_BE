import { CourseRepository, CourseStatus } from '@/api/course';
import { LectureRepository } from '@/api/course-item/lecture/lecture.repository';
import { ReplyRepository } from '@/api/thread/repositories/reply.repository';
import { ThreadRepository } from '@/api/thread/repositories/thread.repository';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReportEntity } from '../entities/user-report.entity';
import { WarningEntity } from '../entities/warning.entity';
import { WarningType } from '../enum/warning-type.enum';
import { UserBanService } from './ban.service';

@Injectable()
export class WarningService {
  private readonly WARNING_LIMIT = 3;

  constructor(
    @InjectRepository(WarningEntity)
    private readonly warningRepo: Repository<WarningEntity>,
    private readonly userBanService: UserBanService,

    private readonly replyRepo: ReplyRepository,
    private readonly threadRepo: ThreadRepository,
    private readonly courseRepo: CourseRepository,
    private readonly lectureRepo: LectureRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async issueWarning(
    user: UserEntity,
    report?: UserReportEntity,
  ): Promise<WarningEntity> {
    const warning = this.warningRepo.create({
      user,
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
        await this.courseRepo.softDelete({ id: report.metadata.course_id });
        break;
      }
      case WarningType.COURSE_ITEM: {
        await this.lectureRepo.update(
          { id: report.metadata.lecture_id },
          { status: CourseStatus.BANNED },
        );
        await this.courseRepo.update(
          { id: report.metadata.course_id },
          { status: CourseStatus.BANNED },
        );
        // notify course user
        // notify throw email; create coupon
        break;
      }
    }
    const active_warnings = await this.getActiveWarnings(user.id);
    if (active_warnings.length >= this.WARNING_LIMIT) {
      await this.userBanService.banUser(user);
    }
    return warning;
  }

  async getActiveWarnings(user_id: Nanoid): Promise<WarningEntity[]> {
    return this.warningRepo.find({
      where: { user: { id: user_id }, ban: null },
      relations: { user: true },
    });
  }
}
