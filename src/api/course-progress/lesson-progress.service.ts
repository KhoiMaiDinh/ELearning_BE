import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { EnrollCourseService } from '@/api/course/services/enroll-course.service';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { IProgressJob, Nanoid, Uuid } from '@/common';
import { ErrorCode, JobName, QueueName } from '@/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { In } from 'typeorm';
import { CourseEntity } from '../course/entities/course.entity';
import { CourseStatus } from '../course/enums/course-status.enum';
import { ICourseProgress } from './interfaces/progress.interface';
import { LessonProgressRepository } from './lesson-progress.repository';

@Injectable()
export class LessonProgressService {
  constructor(
    private readonly progressRepo: LessonProgressRepository,
    private readonly enrollCourseService: EnrollCourseService,
    private readonly userRepo: UserRepository,
    private readonly lectureRepo: LectureRepository,
    @InjectQueue(QueueName.PROGRESS)
    private readonly progressQueue: Queue<IProgressJob, any, string>,
  ) {}

  async upsertWatchTime(
    user_payload: JwtPayloadType,
    lecture_id: Nanoid,
    watched_percentage: number,
  ) {
    const user = await this.userRepo.findOneByPublicId(user_payload.id);
    if (!user) throw new NotFoundException(ErrorCode.E002);

    const lecture = await this.lectureRepo.findOne({
      where: { id: lecture_id },
      relations: { section: { course: true } },
    });
    if (!lecture) throw new NotFoundException(ErrorCode.E033);

    await this.enrollCourseService.isEnrolled(
      lecture.section.course_id,
      user.id,
    );

    let progress = await this.progressRepo.findOne({
      where: { user_id: user.user_id, lecture_id: lecture.lecture_id },
    });

    const completed = watched_percentage >= 80;

    if (!progress) {
      progress = this.progressRepo.create({
        user,
        lecture,
        course_id: lecture.section.course_id,
      });
    } else {
      if (progress.watch_time_in_percentage > watched_percentage)
        return progress;
    }

    progress.watch_time_in_percentage = watched_percentage;
    progress.completed = completed;
    if (completed) {
      await this.progressQueue.add(
        JobName.CHECK_PROGRESS,
        {
          course_id: lecture.section.course_id,
          user_id: user.id,
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 60000 } },
      );
    }

    return this.progressRepo.save(progress);
  }

  async getCourseProgress(
    user_id: Nanoid,
    course_id: Uuid,
  ): Promise<ICourseProgress> {
    // Step 1: Get total lectures in this course
    const total_public_lectures = await this.lectureRepo
      .createQueryBuilder('lecture')
      .innerJoin('lecture.series', 'series')
      .innerJoin('lecture.section', 'section')
      .where('section.course_id = :course_id', { course_id })
      .andWhere('series.status = :status', { status: CourseStatus.PUBLISHED })
      .getCount();

    if (total_public_lectures === 0) {
      return {
        progress: 0,
        total: 0,
        completed: 0,
      };
    }

    // Step 2: Get how many lectures this user has completed
    const completed_lectures = await this.progressRepo.count({
      where: {
        user: { id: user_id },
        lecture: { section: { course_id: course_id } },
        completed: true,
      },
      relations: { lecture: { section: true }, user: true },
    });

    // Step 3: Calculate percentage
    const percent = Math.round(
      (completed_lectures / total_public_lectures) * 100,
    );

    return {
      total: total_public_lectures,
      completed: completed_lectures,
      progress: percent,
    };
  }

  async attachToLectures(course: CourseEntity, user_id: Nanoid): Promise<void> {
    const lecture_ids = course.sections.flatMap((section) =>
      section.lectures.map((lecture) => lecture.lecture_id),
    );

    const progresses = await this.progressRepo.find({
      where: {
        user: { id: user_id },
        lecture_id: In(lecture_ids),
      },
      relations: { user: true },
    });

    // Attach progress to each lecture
    const progress_map = new Map(progresses.map((p) => [p.lecture_id, p]));

    for (const section of course.sections) {
      for (const lecture of section.lectures) {
        const progress = progress_map.get(lecture.lecture_id);
        lecture.progresses = progress ? [progress] : [];
      }
    }
  }
}
