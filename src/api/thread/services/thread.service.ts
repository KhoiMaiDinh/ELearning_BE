import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { InstructorRepository } from '@/api/instructor';
import { NotificationType } from '@/api/notification/enum/notification-type.enum';
import { NotificationBuilderService } from '@/api/notification/notification-builder.service';
import { NotificationService } from '@/api/notification/notification.service';
import { JwtPayloadType } from '@/api/token';
import { CursorPaginationDto, Nanoid, Uuid } from '@/common';
import { ENTITY, ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { buildPaginator } from '@/utils';
import { Injectable } from '@nestjs/common';
import { CreateThreadDto, CursorThreadsQuery, ThreadsQuery } from '../dto';
import { ThreadEntity } from '../entities/thread.entity';
import { ThreadRepository } from '../repositories/thread.repository';

@Injectable()
export class ThreadService {
  constructor(
    private readonly threadRepo: ThreadRepository,
    private readonly lectureRepo: LectureRepository,
    private readonly enrolledRepo: EnrolledCourseRepository,
    private readonly instructorRepo: InstructorRepository,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(author: JwtPayloadType, dto: CreateThreadDto): Promise<any> {
    const lecture = await this.lectureRepo.findOne({
      where: { id: dto.lecture_id },
      relations: {
        section: { course: { instructor: { user: true } } },
        series: true,
      },
    });
    if (!lecture) throw new NotFoundException(ErrorCode.E033);

    const enrolled = await this.enrolledRepo.findOne({
      where: {
        user: { id: author.id },
        course: { course_id: lecture.section.course_id },
      },
      relations: { course: true, user: true },
    });
    if (!enrolled) throw new NotFoundException(ErrorCode.E038);

    const thread = this.threadRepo.create({
      title: dto.title,
      content: dto.content,
      lecture,
      author: enrolled.user,
    });

    const saved_thread = await this.threadRepo.save(thread);
    await this.sendNewThreadNotification(saved_thread);
    return saved_thread;
  }

  async getByLecture(lecture_id: Nanoid): Promise<ThreadEntity[]> {
    return this.threadRepo.find({
      where: { lecture: { id: lecture_id } },
      order: { createdAt: 'DESC' },
      relations: {
        author: { profile_image: true },
      },
    });
  }

  async getOne(thread_id: Nanoid): Promise<ThreadEntity> {
    const thread = await this.threadRepo.findOne({
      where: { id: thread_id },
      relations: {
        author: { profile_image: true },
        replies: { author: { profile_image: true } },
        lecture: { section: { course: true } },
      },
    });

    if (!thread) throw new NotFoundException(ErrorCode.E040);
    return thread;
  }

  async find(
    filter: CursorThreadsQuery | ThreadsQuery,
    options?: { instructor_id?: Uuid },
  ) {
    const query_builder = this.threadRepo.createQueryBuilder('thread');
    query_builder
      .leftJoinAndSelect('thread.author', 'author')
      .leftJoinAndSelect('author.profile_image', 'profile_image')
      .leftJoinAndSelect('thread.lecture', 'lecture')
      .leftJoinAndSelect('lecture.series', 'series')
      .leftJoinAndSelect('lecture.section', 'section')
      .leftJoinAndSelect('section.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor');

    query_builder.orderBy('thread.createdAt', filter.order || 'DESC');

    if (filter.has_replied !== undefined) {
      const condition = `
        ${filter.has_replied ? '' : 'NOT'} EXISTS (
          SELECT 1
          FROM "${ENTITY.REPLY}" reply
          INNER JOIN "user" reply_author ON reply.author_id = reply_author.user_id
          WHERE reply.thread_id = thread.thread_id
          AND reply_author.user_id = instructor.user_id
        )
      `;
      query_builder.andWhere(condition);
    }

    if (options?.instructor_id) {
      query_builder.andWhere('course.instructor_id = :instructor_id', {
        instructor_id: options.instructor_id,
      });
    }

    if (filter instanceof CursorThreadsQuery) {
      const paginator = buildPaginator({
        entity: ThreadEntity,
        alias: 'thread',
        paginationKeys: ['createdAt'],
        query: {
          limit: filter.limit,
          order: filter.order,
          afterCursor: filter.afterCursor,
          beforeCursor: filter.beforeCursor,
        },
      });

      const { data: threads, cursor } = await paginator.paginate(query_builder);

      const metaDto = new CursorPaginationDto(
        threads.length,
        cursor.afterCursor,
        cursor.beforeCursor,
        filter,
      );

      return { threads, metaDto };
    } else {
      const threads = await query_builder.getMany();
      return { threads, metaDto: null };
    }
  }

  async getFromInstructor(
    user_payload: JwtPayloadType,
    filter: CursorThreadsQuery,
  ) {
    const instructor = await this.instructorRepo.findOneByUserPublicId(
      user_payload.id,
    );

    const { threads, metaDto } = await this.find(filter, {
      instructor_id: instructor.instructor_id,
    });

    return { threads, metaDto };
  }

  private async sendNewThreadNotification(thread: ThreadEntity) {
    const built_notification = this.notificationBuilder.newThread(thread);
    const notification = await this.notificationService.save(
      thread.lecture.section.course.instructor.user_id,
      NotificationType.NEW_THREAD,
      {
        thread_id: thread.id,
        course_id: thread.lecture.section.course.id,
        lecture_id: thread.lecture.id,
      },
      built_notification,
    );
    this.notificationGateway.emitToUser(
      thread.lecture.section.course.instructor.user.id,
      {
        ...notification,
        ...built_notification,
      },
    );
  }

  // async getOne(thread_id: Nanoid): Promise<> {
  //   const thread = await this.threadRepo.findOne({
  //     where: { id: thread_id },
  //     relations: {
  //       author: { profile_image: true },
  //       replies: { author: { profile_image: true } },
  //       lecture: { section: { course: true } },
  //     },
  //   });
  //   if (!thread) throw new NotFoundException(ErrorCode.E040);
  // }
}
