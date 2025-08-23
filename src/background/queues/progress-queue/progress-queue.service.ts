import { LessonProgressService } from '@/api/course-progress/lesson-progress.service';
import { EnrollCourseService } from '@/api/course/services/enroll-course.service';
import { IProgressJob } from '@/common/interfaces/job.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ProgressQueueService {
  private readonly logger = new Logger(ProgressQueueService.name);

  constructor(
    private readonly progressService: LessonProgressService,
    private readonly enrollCourseService: EnrollCourseService,
  ) {}

  async checkCourseCompletion(data: IProgressJob) {
    const { course_id, user_id } = data;
    const course_progress = await this.progressService.getCourseProgress(
      user_id,
      course_id,
    );
    if (course_progress.progress == 100) {
      await this.enrollCourseService.markCourseCompleted(user_id, course_id);
    }
  }
}
