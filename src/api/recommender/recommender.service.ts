import { CourseService } from '@/api/course/services/course.service';
import { PreferenceRepository } from '@/api/preference/preference.repository';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, Uuid } from '@/common';
import { AllConfigType } from '@/config';
import { ENTITY as E } from '@/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';
import { RecommendCourseQuery } from './dto';

@Injectable()
export class RecommenderService {
  private readonly logger = new Logger(RecommenderService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly dataSource: DataSource,
    private readonly userRepo: UserRepository,
    private readonly courseService: CourseService,
    private readonly preferenceRepo: PreferenceRepository,
  ) {}

  async findSimilarCourses(course_id: Nanoid) {
    const course_ids = await this.fetchRecommendations([course_id], 5);
    return await this.courseService.findIn(course_ids);
  }

  async recommendCoursesForUser(user_id: Nanoid, query: RecommendCourseQuery) {
    const user = await this.userRepo.findOneByPublicId(user_id);

    const user_interacted_courses = await this.getRecentUserInteractions(
      user.user_id,
    );

    if (user_interacted_courses.length === 0) {
      return this.recommendTrendingCoursesByPreference(
        user.user_id,
        query.amount,
      );
    }

    const interacted_course_ids = user_interacted_courses.map((row) => row.id);
    const recommended = await this.fetchRecommendations(
      interacted_course_ids,
      query.amount,
    );
    const recommended_ids = recommended.map((row) => row.id);

    return this.courseService.findIn(recommended_ids);
  }

  private async getRecentUserInteractions(user_id: Uuid) {
    return this.dataSource.query(
      `
        WITH recent_interactions AS (
          SELECT course_id, MAX(interacted_at) AS last_interacted
          FROM (
            SELECT course_id, created_at AS interacted_at
            FROM "${E.FAVORITE_COURSE}" WHERE user_id = $1
            UNION ALL
            SELECT course_id, created_at AS interacted_at
            FROM "${E.ENROLLED_COURSE}" WHERE user_id = $1
          ) AS interactions
          GROUP BY course_id
          ORDER BY last_interacted DESC
          LIMIT 5
        )
        SELECT c.id, ri.last_interacted
        FROM recent_interactions ri
        JOIN course c ON c.course_id = ri.course_id
        ORDER BY ri.last_interacted DESC
      `,
      [user_id],
    );
  }

  private async recommendTrendingCoursesByPreference(
    user_id: Uuid,
    limit: number,
  ) {
    const { categories } = await this.preferenceRepo.findOne({
      where: { user_id },
      relations: { categories: true },
    });

    if (!categories || categories.length === 0) return [];

    const trending_courses = await this.dataSource.query(
      `
        SELECT c.id
        FROM course c
        JOIN category cat ON cat.category_id = c.category_id
        LEFT JOIN (
          SELECT course_id, SUM(weighted_score) AS popularity_score
          FROM (
            SELECT course_id, COUNT(*) * 1.0 AS weighted_score
            FROM "${E.ENROLLED_COURSE}"
            WHERE created_at > NOW() - INTERVAL '30 days'
            GROUP BY course_id
  
            UNION ALL
  
            SELECT course_id, COUNT(*) * 2.0 AS weighted_score
            FROM "${E.FAVORITE_COURSE}"
            WHERE created_at > NOW() - INTERVAL '30 days'
            GROUP BY course_id
          ) AS weighted_scores
          GROUP BY course_id
        ) AS trend ON c.course_id = trend.course_id
        WHERE cat.category_id = ANY($1)
        ORDER BY trend.popularity_score DESC NULLS LAST
        LIMIT $2
      `,
      [categories.map((cat) => cat.category_id), limit],
    );

    const trending_course_ids = trending_courses.map((row) => row.id);
    return this.courseService.findIn(trending_course_ids);
  }

  private async fetchRecommendations(course_ids: Nanoid[], top_k: number) {
    try {
      const url = this.configService.get('third_party.base_url', {
        infer: true,
      });

      const params = {
        courses: course_ids,
        top_k,
      };
      const response = await firstValueFrom(
        this.httpService.get(url, { params }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}
