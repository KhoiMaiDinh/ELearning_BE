import { EnrollCourseService } from '@/api/course/services/enroll-course.service';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, Uuid } from '@/common';
import { ErrorCode } from '@/constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LectureRepository } from '../course-item/lecture/lecture.repository';
import { CourseEntity } from '../course/entities/course.entity';
import { CourseStatus } from '../course/enums/course-status.enum';
import { JwtPayloadType } from '../token';
import { UserLessonProgressEntity } from './entities/lesson-progress.entity';

@Injectable()
export class LessonProgressService {
  constructor(
    @InjectRepository(UserLessonProgressEntity)
    private readonly progressRepo: Repository<UserLessonProgressEntity>,
    private readonly enrollCourseService: EnrollCourseService,
    private readonly userRepo: UserRepository,
    private readonly lectureRepo: LectureRepository,
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
      relations: { section: true, videos: true },
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

    return this.progressRepo.save(progress);
  }

  async getCourseProgress(user_id: Nanoid, course_id: Uuid) {
    // Step 1: Get total lectures in this course
    const total_lectures = await this.lectureRepo.count({
      where: {
        section: { course_id: course_id },
        status: CourseStatus.PUBLISHED,
      },
      relations: { section: true },
    });

    if (total_lectures === 0) {
      return { progress: 0, total: 0, completed: 0 };
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
    const percent = Math.round((completed_lectures / total_lectures) * 100);

    return {
      total: total_lectures,
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
