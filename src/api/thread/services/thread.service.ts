import { LectureRepository } from '@/api/course-item/lecture/lecture.repository';
import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { CreateThreadDto } from '../dto';
import { ThreadEntity } from '../entities/thread.entity';
import { ThreadRepository } from '../repositories/thread.repository';

@Injectable()
export class ThreadService {
  constructor(
    private readonly threadRepo: ThreadRepository,

    private readonly lectureRepo: LectureRepository,
    private readonly enrolledRepo: EnrolledCourseRepository,
  ) {}

  async create(author: JwtPayloadType, dto: CreateThreadDto): Promise<any> {
    const lecture = await this.lectureRepo.findOne({
      where: { id: dto.lecture_id },
      relations: { section: true },
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

    return this.threadRepo.save(thread);
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
      },
    });

    if (!thread) throw new NotFoundException(ErrorCode.E040);
    return thread;
  }
}
