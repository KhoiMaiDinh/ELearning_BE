import { Nanoid } from '@/common';
import { ENTITY } from '@/constants';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Unit } from '../dto';
import { Emotion } from '../enum';
import { CommentAspectRepository } from '../repositories/comment-aspect.repository';
import { LectureCommentRepository } from '../repositories/lecture-comment.repository';

@Injectable()
export class LectureCommentAnalyzer {
  constructor(
    private readonly commentRepo: LectureCommentRepository,
    private readonly aspectRepo: CommentAspectRepository,
  ) {}

  private async getInstructorCommentedLectures(
    user_id: Nanoid,
    period?: { start: Date; end: Date },
  ): Promise<{
    lecture_ids: string[];
    active_course_count: number;
  }> {
    const queryBuilder = this.commentRepo
      .createQueryBuilder('comment')
      .select(['lecture.lecture_id', 'course.course_id'])
      .innerJoin('comment.lecture', 'lecture')
      .leftJoinAndSelect('lecture.section', 'section')
      .leftJoinAndSelect('section.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user', 'user.id = :user_id', {
        user_id,
      })
      .distinct(true);

    if (period) {
      queryBuilder
        .andWhere('comment.created_at >= :start', { start: period.start })
        .andWhere('comment.created_at <= :end', { end: period.end });
    }

    const lectures = await queryBuilder.getRawMany();

    const lecture_ids = lectures.map((l) => l.lecture_lecture_id);
    const unique_course_ids = new Set(lectures.map((l) => l.course_course_id));

    return {
      lecture_ids: lecture_ids,
      active_course_count: unique_course_ids.size,
    };
  }

  private async getCommentCount(lecture_ids: string[]): Promise<number> {
    if (lecture_ids.length === 0) return 0;
    return await this.commentRepo.count({
      where: { lecture_id: In(lecture_ids) },
    });
  }

  private async getLeadingEmotion(
    lecture_ids: string[],
    period?: { start: Date; end: Date },
  ): Promise<{ emotion: Emotion | null; portion: number }> {
    if (lecture_ids.length === 0) return { emotion: null, portion: 0 };

    const queryBuilder = this.aspectRepo
      .createQueryBuilder('aspect')
      .leftJoin('aspect.comment', 'comment')
      .where('comment.lecture_id IN (:...lecture_ids)', { lecture_ids });

    if (period) {
      queryBuilder.andWhere('comment.created_at >= :start', {
        start: period.start,
      });
      queryBuilder.andWhere('comment.created_at <= :end', {
        end: period.end,
      });
    }

    const emotion_counts = await queryBuilder
      .select(['aspect.emotion AS emotion', 'COUNT(*)::int AS count'])
      .groupBy('aspect.emotion')
      .getRawMany();

    if (emotion_counts.length === 0) {
      return { emotion: null, portion: 0 };
    }

    const total_count = emotion_counts.reduce(
      (sum, curr) => sum + curr.count,
      0,
    );
    const leading = emotion_counts.reduce(
      (max, curr) => (curr.count > max.count ? curr : max),
      { emotion: null, count: 0 } as { emotion: Emotion | null; count: number },
    );

    return {
      emotion: leading.emotion,
      portion: leading.count / total_count,
    };
  }

  async getInstructorFeedbackStats(
    user_id: Nanoid,
    period?: { start: Date; end: Date },
  ): Promise<{
    total_comments: number;
    leading_emotion: Emotion | null;
    leading_emotion_percentage: number | null;
    active_course_count: number;
  }> {
    const { lecture_ids, active_course_count } =
      await this.getInstructorCommentedLectures(user_id, period);

    if (lecture_ids.length === 0) {
      return {
        total_comments: 0,
        leading_emotion: null,
        leading_emotion_percentage: null,
        active_course_count: 0,
      };
    }

    const [total_comments, leading] = await Promise.all([
      this.getCommentCount(lecture_ids),
      this.getLeadingEmotion(lecture_ids, period),
    ]);

    return {
      total_comments,
      leading_emotion: leading.emotion,
      leading_emotion_percentage: leading.portion,
      active_course_count,
    };
  }

  async findInCourseAspects(course_id: Nanoid) {
    const rows = await this.aspectRepo
      .createQueryBuilder('aspect')
      .select([
        'lecture.lecture_id AS lecture_id',
        'series.title AS lecture_title',
        'aspect.aspect AS aspect',
        'aspect.emotion AS emotion',
        'COUNT(*)::int AS count',
      ])
      .innerJoin('aspect.comment', 'comment')
      .innerJoin('comment.lecture', 'lecture')
      .innerJoin('lecture.section', 'section')
      .innerJoin('section.course', 'course', 'course.id = :course_id', {
        course_id,
      })
      .innerJoin('lecture.series', 'series', 'series.status = :status', {
        status: 'PUBLISHED',
      })
      .innerJoin(
        (qb) =>
          qb
            .from(ENTITY.LECTURE_SERIES, 'sub')
            .select('sub.lecture_id', 'lecture_id')
            .addSelect('MAX(sub.version)', 'max_version')
            .groupBy('sub.lecture_id'),
        'latest',
        'latest.lecture_id = series.lecture_id AND latest.max_version = series.version',
      )
      .groupBy(
        'lecture.lecture_id, series.title, aspect.aspect, aspect.emotion',
      )
      .orderBy('lecture.lecture_id')
      .getRawMany();

    const resultMap = new Map<
      string,
      {
        lecture_id: string;
        lecture_title: string;
        statistics: Record<string, Record<Emotion, number>>;
      }
    >();

    for (const row of rows) {
      const lecture_id = row.lecture_id;
      const lecture_title = row.lecture_title;
      const aspect = row.aspect;
      const emotion: Emotion = row.emotion;
      const count = parseInt(row.count, 10);

      if (!resultMap.has(lecture_id)) {
        resultMap.set(lecture_id, {
          lecture_id,
          lecture_title,
          statistics: {},
        });
      }

      const lectureEntry = resultMap.get(lecture_id)!;

      if (!lectureEntry.statistics[aspect]) {
        lectureEntry.statistics[aspect] = {
          positive: 0,
          neutral: 0,
          negative: 0,
          conflict: 0,
          none: 0,
        };
      }

      lectureEntry.statistics[aspect][emotion] += count;
    }

    return Array.from(resultMap.values());
  }

  async getEmotionTrendsOverTime(
    user_id: Nanoid,
    options: {
      unit: Unit;
      count: number;
      course_id?: Nanoid;
    },
  ): Promise<
    {
      period: string;
      positive: number;
      negative: number;
      neutral: number;
      conflict: number;
    }[]
  > {
    const queryBuilder = this.commentRepo
      .createQueryBuilder('comment')
      .select([
        `DATE_TRUNC(:unit, comment.created_at) AS period`,
        'aspect.emotion AS emotion',
        'COUNT(*)::int AS count',
      ])
      .innerJoin('comment.aspects', 'aspect')
      .innerJoin('comment.lecture', 'lecture')
      .innerJoin('lecture.section', 'section')
      .innerJoin('section.course', 'course')
      .innerJoin('course.instructor', 'instructor')
      .innerJoin('instructor.user', 'user', 'user.id = :user_id', { user_id })
      .groupBy('period, aspect.emotion')
      .orderBy('period', 'DESC')
      .setParameters({ unit: options.unit })
      .limit(options.count * 4);

    if (options.course_id) {
      queryBuilder.andWhere('course.id = :course_id', {
        course_id: options.course_id,
      });
    }

    const rawResults = await queryBuilder.getRawMany();

    // Group by period and emotion
    const grouped = new Map<string, Record<string, number>>();

    for (const row of rawResults) {
      const period = row.period.toISOString().split('T')[0];
      const emotion = row.emotion;
      const count = parseInt(row.count, 10);

      if (!grouped.has(period)) {
        grouped.set(period, {
          positive: 0,
          negative: 0,
          neutral: 0,
          conflict: 0,
        });
      }
      grouped.get(period)![emotion] += count;
    }

    // Convert to array with percentages
    const result = Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0])) // ascending by period
      .slice(-options.count) // pick most recent N
      .map(([period, counts]) => {
        const total =
          counts.positive + counts.negative + counts.neutral + counts.conflict;
        return {
          period,
          positive: total ? (counts.positive / total) * 100 : 0,
          negative: total ? (counts.negative / total) * 100 : 0,
          neutral: total ? (counts.neutral / total) * 100 : 0,
          conflict: total ? (counts.conflict / total) * 100 : 0,
        };
      });

    return result;
  }
}
