import { CourseRepository } from '@/api/course';
import { LessonProgressRepository } from '@/api/course-progress/lesson-progress.repository';
import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { Uuid } from '@/common';
import { MONTHLY_LABELS } from '@/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseAnalyzer {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly courseProgressRepo: LessonProgressRepository,
    private readonly enrollRepo: EnrolledCourseRepository,
  ) {}

  async count(start?: Date, end?: Date): Promise<number> {
    const query_builder = this.courseRepo.createQueryBuilder('course');
    if (start)
      query_builder.andWhere('course.published_at >= :start', { start });
    if (end) query_builder.andWhere('course.published_at <= :end', { end });
    return query_builder.getCount();
  }

  async countEnrolled(
    start?: Date,
    end?: Date,
    instructor_id?: Uuid,
  ): Promise<number> {
    const query_builder = this.enrollRepo
      .createQueryBuilder('enrolled')
      .select('COUNT(DISTINCT enrolled.user_id)', 'count')
      .andWhere('enrolled.created_at BETWEEN :start AND :end', { start, end });

    if (instructor_id) {
      query_builder
        .innerJoin('enrolled.course', 'course')
        .andWhere('course.instructor_id = :instructor_id', {
          instructor_id,
        });
    }
    const enrolled = query_builder
      .getRawOne()
      .then((res) => parseInt(res.count, 10));
    return enrolled;
  }

  async getCompletionRates(instructor_id: Uuid) {
    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('course.enrolled_users', 'enrolled')
      .select('course.title', 'title')
      .addSelect('COUNT(enrolled.user_id)', 'total_students')
      .addSelect(
        `COUNT(CASE WHEN enrolled.is_completed = true THEN 1 END)`,
        'completed_students',
      )
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .andWhere('course.published_at IS NOT NULL')
      .groupBy('course.course_id');

    const raw_results = await qb.getRawMany();

    return raw_results.map((course) => ({
      title: course.title,
      total_students: parseInt(course.total_students, 10),
      completed_students: parseInt(course.completed_students, 10),
      completion_rate:
        course.total_students > 0
          ? Math.round(
              (course.completed_students / course.total_students) * 100,
            )
          : 0,
    }));
  }

  async getAverageEngagement(instructor_id: Uuid) {
    return this.courseProgressRepo
      .createQueryBuilder('progress')
      .innerJoin('progress.course', 'course')
      .select('course.id', 'id')
      .where('course.instructor_id =:instructor_id', { instructor_id })
      .addSelect('course.title', 'title')
      .addSelect('AVG(progress.watch_time_in_percentage)', 'avg_engagement')
      .groupBy('course.course_id')
      .addGroupBy('course.title')
      .orderBy('avg_engagement', 'DESC')
      .getRawMany();
  }

  async getMonthlyEnrolled(year: number, instructor_id: Uuid) {
    const raw_result = await this.enrollRepo
      .createQueryBuilder('enrolled')
      .innerJoin('enrolled.course', 'course')
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .select([
        'EXTRACT(MONTH FROM enrolled.created_at) AS month',
        'COUNT(*)::int AS count',
      ])
      .andWhere('EXTRACT(YEAR FROM enrolled.created_at) = :year', {
        year: year,
      })
      .groupBy('month')
      .orderBy('month')
      .getRawMany();

    const monthly_data = Array(12).fill(0);
    for (const row of raw_result) {
      const month = parseInt(row.month, 10);
      monthly_data[month - 1] = parseInt(row.count, 10);
    }

    return {
      labels: MONTHLY_LABELS,
      data: monthly_data,
    };
  }

  async getLearningProgressOverview(start?: Date, end?: Date) {
    const progress = await this.courseProgressRepo
      .createQueryBuilder('p')
      .andWhere('p.created_at BETWEEN :start AND :end', { start, end })
      .select('p.user_id', 'user_id')
      .addSelect('p.course_id', 'course_id')
      .addSelect(
        'SUM(CASE WHEN p.completed THEN 1 ELSE 0 END)::float / COUNT(*)',
        'completion_ratio',
      )
      .groupBy('p.user_id, p.course_id')
      .getRawMany();
    return progress;
  }

  async reviewedCount(start?: Date, end?: Date) {
    const reviewed = await this.enrollRepo
      .createQueryBuilder('enrolled')
      .where('enrolled.rating IS NOT NULL')
      .andWhere('enrolled.created_at BETWEEN :start AND :end', { start, end })
      .select('COUNT(DISTINCT enrolled.user_id)', 'count')
      .getRawOne()
      .then((res) => parseInt(res.count, 10));
    return reviewed;
  }

  async getActiveStudent(start: Date, end: Date, instructor_id: Uuid) {
    const active_count = await this.courseProgressRepo
      .createQueryBuilder('progress')
      .innerJoin('progress.course', 'course')
      .select('COUNT(DISTINCT progress.user_id)', 'active_students')
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .andWhere('progress.created_at >= :start', { start })
      .andWhere('progress.created_at < :end', { end })
      .getRawOne();

    return parseInt(active_count.active_students, 10);
  }

  async getInstructorAvgRating(instructor_id: Uuid) {
    const result = await this.enrollRepo
      .createQueryBuilder('enrolled')
      .innerJoin('enrolled.course', 'course')
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .andWhere('enrolled.rating IS NOT NULL')
      .select([
        'AVG(enrolled.rating) AS avg_rating',
        'COUNT(enrolled.rating) AS total_ratings',
      ])
      .getRawOne();

    return {
      avg_rating: parseFloat(result.avg_rating),
      total_ratings_made: result.total_ratings,
    };
  }

  async getAverageRatings(instructor_id: Uuid) {
    return this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('course.enrolled_users', 'enrollment')
      .select('course.id', 'id')
      .addSelect('course.title', 'title')
      .addSelect('AVG(enrollment.rating)', 'average_rating')
      .addSelect('COUNT(enrollment.rating)', 'rating_count')
      .where('course.instructor_id = :instructor_id', {
        instructor_id: instructor_id,
      })
      .andWhere('enrollment.rating IS NOT NULL')
      .groupBy('course.id')
      .addGroupBy('course.title')
      .getRawMany();
  }
}
