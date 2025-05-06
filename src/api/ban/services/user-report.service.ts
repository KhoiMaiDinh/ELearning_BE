import { CourseRepository } from '@/api/course';
import { LectureRepository } from '@/api/course-item/lecture/lecture.repository';
import { ReplyRepository } from '@/api/thread/repositories/reply.repository';
import { ThreadRepository } from '@/api/thread/repositories/thread.repository';
import { JwtPayloadType } from '@/api/token';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, OffsetPaginatedDto } from '@/common';
import { paginate } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { ReportQuery, ReportRes } from '../dto';
import { ReportReq } from '../dto/report.req.dto';
import { ReviewReportReq } from '../dto/review-report.req.dto';
import { UserReportEntity } from '../entities/user-report.entity';
import { WarningType } from '../enum/warning-type.enum';
import { WarningMetadataMap } from '../interface/metadata-map.type';
import { WarningService } from './warning.service';

@Injectable()
export class UserReportService {
  constructor(
    @InjectRepository(UserReportEntity)
    private readonly reportRepo: Repository<UserReportEntity>,

    private readonly replyRepo: ReplyRepository,
    private readonly threadRepo: ThreadRepository,
    private readonly courseRepo: CourseRepository,
    private readonly lectureRepo: LectureRepository,
    private readonly warningService: WarningService,
    private readonly userRepo: UserRepository,
  ) {}

  async createReport(data: ReportReq): Promise<UserReportEntity> {
    const { reporter_id, type, content_id, reason } = data;
    const reporter = await this.userRepo.findOne({
      where: { id: reporter_id },
    });
    let metadata = null;
    switch (type) {
      case WarningType.REPLY:
        metadata = {
          reply_id: content_id,
        } as WarningMetadataMap[WarningType.REPLY];
        break;
      case WarningType.THREAD:
        metadata = {
          thread_id: content_id,
        };
        break;
      case WarningType.COURSE:
        metadata = {
          course_id: content_id,
        };
        break;
      case WarningType.COURSE_ITEM:
        metadata = {
          lecture_id: content_id,
        };
        break;
      default:
        break;
    }
    const report = this.reportRepo.create({
      reporter,
      type,
      reason,
      metadata,
    });
    return this.reportRepo.save(report);
  }

  async markReportAsReviewed(
    report_id: Nanoid,
    user_payload: JwtPayloadType,
    data: ReviewReportReq,
  ): Promise<void> {
    const report = await this.reportRepo.findOne({
      where: { id: report_id },
      relations: { reporter: true },
    });
    report.is_reviewed = data.is_valid;
    await this.reportRepo.save(report);

    let user: UserEntity;

    switch (report.type) {
      case WarningType.REPLY: {
        const reply = await this.replyRepo.findOne({
          where: { id: report.metadata.reply_id },
          relations: { author: true },
        });
        user = reply.author;
        break;
      }
      case WarningType.THREAD: {
        const thread = await this.threadRepo.findOne({
          where: { id: report.metadata.thread_id },
          relations: { author: true },
        });
        user = thread.author;
        break;
      }
      case WarningType.COURSE: {
        const course = await this.courseRepo.findOne({
          where: { id: report.metadata.course_id },
          relations: { instructor: { user: true } },
        });
        user = course.instructor.user;
        break;
      }
      case WarningType.COURSE_ITEM: {
        const lecture = await this.lectureRepo.findOne({
          where: { id: report.metadata.lecture_id },
          relations: { section: { course: { instructor: { user: true } } } },
        });
        user = lecture.section.course.instructor.user;
        break;
      }
      default:
        break;
    }

    if (data.is_valid) {
      await this.warningService.issueWarning(user_payload, user, report);
    }
  }

  async find(query: ReportQuery): Promise<OffsetPaginatedDto<ReportRes>> {
    const query_builder = this.reportRepo.createQueryBuilder('report');

    if (query.is_reviewed !== undefined) {
      query_builder.andWhere('report.is_reviewed = :is_reviewed', {
        is_reviewed: query.is_reviewed,
      });
    }

    query_builder.orderBy('report.createdAt', 'ASC');

    const [users, metaDto] = await paginate<UserReportEntity>(
      query_builder,
      query,
      {
        skipCount: false,
        takeAll: false,
      },
    );
    return new OffsetPaginatedDto(plainToInstance(ReportRes, users), metaDto);
  }
}
