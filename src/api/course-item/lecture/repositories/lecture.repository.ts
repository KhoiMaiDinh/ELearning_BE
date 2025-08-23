import { LectureEntity } from '@/api/course-item/lecture/entities/lecture.entity';
import { CourseStatus } from '@/api/course/enums';
import { Uuid } from '@/common';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LectureRepository extends Repository<LectureEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(LectureEntity, dataSource.createEntityManager());
  }

  async countTotalPublicLectures(course_id: Uuid): Promise<number> {
    const total_public_lectures = await this.createQueryBuilder('lecture')
      .innerJoin('lecture.series', 'series')
      .innerJoin('lecture.section', 'section')
      .where('section.course_id = :course_id', { course_id })
      .andWhere('series.status = :status', { status: CourseStatus.PUBLISHED })
      .getCount();
    return total_public_lectures;
  }
}
