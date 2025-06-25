import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { InstructorRepository } from '@/api/instructor';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { CursorPaginationDto, Nanoid, Uuid } from '@/common';
import { ErrorCode, KafkaTopic } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { KafkaProducerService } from '@/kafka';
import { buildPaginator } from '@/utils';
import { Injectable } from '@nestjs/common';
import { NotificationType } from '../../notification/enum/notification-type.enum';
import { NotificationBuilderService } from '../../notification/notification-builder.service';
import { NotificationService } from '../../notification/notification.service';
import { CreateCommentReq, LectureCommentRes } from '../dto';
import {
  LectureCommentsQuery,
  PaginateLectureCommentsQuery,
} from '../dto/lecture-comments.query.dto';
import { CommentAspectEntity } from '../entities/comment-aspect.entity';
import { LectureCommentEntity } from '../entities/lecture-comment.entity';
import { Aspect, Emotion } from '../enum';
import { LectureCommentRepository } from '../repositories/lecture-comment.repository';

@Injectable()
export class LectureCommentService {
  constructor(
    private readonly commentRepo: LectureCommentRepository,
    private readonly instructorRepo: InstructorRepository,
    private readonly lectureRepo: LectureRepository,
    private readonly producerService: KafkaProducerService,
    private readonly userRepo: UserRepository,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
  ) {}

  async markAllAsSolved(lecture_id: Uuid) {
    await this.commentRepo
      .createQueryBuilder()
      .update(LectureCommentEntity)
      .set({ is_solved: true })
      .where('lecture_id = :lecture_id', { lecture_id })
      .execute();
  }

  async create(user_payload: JwtPayloadType, dto: CreateCommentReq) {
    const lecture = await this.lectureRepo.findOne({
      where: { id: dto.lecture_id },
      relations: {
        section: { course: { instructor: { user: true } } },
        series: true,
      },
    });

    if (!lecture) throw new NotFoundException(ErrorCode.E033);

    const user = await this.userRepo.findOneByPublicId(user_payload.id);

    const comment = this.commentRepo.create({
      content: dto.content,
      user,
      lecture,
    });

    await this.commentRepo.save(comment);

    const notification_receiver = {
      user_id: lecture.section.course.instructor.user_id,
      id: lecture.section.course.instructor.user.id,
    };

    const notification = await this.notificationService.save(
      notification_receiver.user_id,
      NotificationType.NEW_COMMENT,
      {
        comment_id: comment.id,
        lecture_id: lecture.id,
        course_id: lecture.section.course.id,
      },
      {
        title: 'Feedback mới từ Học viên',
        body: `Học viên ${user.username} đã gửi feedback về bài học ${lecture.title}`,
      },
    );
    const built_notification =
      this.notificationBuilder.newCommentContent(comment);

    this.notificationGateway.emitToUser(notification_receiver.id, {
      ...notification,
      ...built_notification,
    });

    this.producerService.send(
      KafkaTopic.COMMENT_CREATED,
      JSON.stringify(comment),
    );
    return comment.toDto(LectureCommentRes);
  }

  async findAllForInstructor(
    user: JwtPayloadType,
    filter: PaginateLectureCommentsQuery,
  ) {
    const instructor = await this.instructorRepo.findOneByUserPublicId(user.id);
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    const comments = await this.findComments(
      { instructor_id: instructor.instructor_id },
      filter,
    );

    return comments;
  }

  async findInLecture(lecture_id: Nanoid, filter: LectureCommentsQuery) {
    const { comments } = await this.findComments({ lecture_id }, filter);
    const statistics: Record<string, Record<Emotion, number>> = {};

    for (const comment of comments) {
      for (const aspect of comment.aspects) {
        if (!statistics[aspect.aspect]) {
          statistics[aspect.aspect] = {
            positive: 0,
            neutral: 0,
            negative: 0,
            conflict: 0,
            none: 0,
          };
        }
        statistics[aspect.aspect][aspect.emotion]++;
      }
    }

    return { comments, statistics };
  }

  async saveAnalysis(
    lecture_comment_id: Uuid,
    analysis: { aspect: Aspect; emotion: Emotion }[],
  ) {
    const comment = await this.commentRepo.findOne({
      where: { lecture_comment_id },
      relations: ['aspects'],
    });

    if (!comment) throw new NotFoundException(ErrorCode.E073);

    const aspects = analysis.map((entry) => {
      if (entry.emotion != Emotion.NONE) {
        const aspect = new CommentAspectEntity({
          aspect: entry.aspect,
          emotion: entry.emotion,
        });
        return aspect;
      }
    });

    comment.aspects = aspects;

    await this.commentRepo.save(comment);

    return comment;
  }

  async findOne(id: Nanoid): Promise<LectureCommentRes> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: {
        user: { profile_image: true },
        aspects: true,
        lecture: { series: true },
      },
    });

    if (!comment) {
      throw new NotFoundException(ErrorCode.E073);
    }

    return comment.toDto(LectureCommentRes);
  }

  async findComments(
    options: { lecture_id?: Nanoid; instructor_id?: Uuid },
    filter: LectureCommentsQuery | PaginateLectureCommentsQuery,
  ) {
    const query = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.aspects', 'aspect')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .leftJoinAndSelect('comment.lecture', 'lecture')
      .leftJoinAndSelect('lecture.series', 'series');

    if (options.lecture_id)
      query.where('lecture.id = :lecture_id', {
        lecture_id: options.lecture_id,
      });
    if (options.instructor_id) {
      query
        .leftJoinAndSelect('lecture.section', 'section')
        .leftJoinAndSelect('section.course', 'course')
        .leftJoinAndSelect('course.instructor', 'instructor')
        .where('course.instructor_id = :instructor_id', {
          instructor_id: options.instructor_id,
        });
    }

    // Optional filters
    if (filter.aspect) {
      query.andWhere('aspect.aspect = :aspect', { aspect: filter.aspect });
    }

    if (filter.emotion) {
      query.andWhere('aspect.emotion = :emotion', {
        emotion: filter.emotion,
      });
    }

    if (filter.is_solved !== undefined) {
      query.andWhere('comment.is_solved = :is_solved', {
        is_solved: filter.is_solved,
      });
    }

    if (filter instanceof PaginateLectureCommentsQuery) {
      const paginator = buildPaginator({
        entity: LectureCommentEntity,
        alias: 'comment',
        paginationKeys: ['createdAt'],
        query: {
          limit: filter.limit,
          order: filter.order,
          afterCursor: filter.afterCursor,
          beforeCursor: filter.beforeCursor,
        },
      });

      const { data: comments, cursor } = await paginator.paginate(query);

      const metaDto = new CursorPaginationDto(
        comments.length,
        cursor.afterCursor,
        cursor.beforeCursor,
        filter,
      );

      return { comments, metaDto };
    } else {
      query.orderBy('comment.createdAt', filter.order);
      const comments = await query.getMany();
      return { comments, metaDto: null };
    }
  }
}
