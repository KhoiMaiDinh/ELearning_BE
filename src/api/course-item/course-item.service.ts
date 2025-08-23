import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { LectureEntity } from '@/api/course-item/lecture/entities/lecture.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { MediaRepository } from '@/api/media';
import { SectionEntity } from '@/api/section/entities/section.entity';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid, Uuid } from '@/common';
import { ErrorCode, Order, PERMISSION } from '@/constants';
import { ForbiddenException } from '@/exceptions';
import { mergeSortedArrays } from '@/utils';
import { LexoRank } from '@dalet-oss/lexorank';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export abstract class CourseItemService {
  constructor(
    protected readonly sectionRepository: SectionRepository,
    @InjectRepository(LectureEntity)
    protected readonly lectureRepository: Repository<LectureEntity>,
    @InjectRepository(ArticleEntity)
    protected readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(QuizEntity)
    protected readonly quizRepository: Repository<QuizEntity>,
    protected readonly mediaRepository: MediaRepository,
  ) {}

  abstract findOne(user: JwtPayloadType, id: Nanoid): Promise<any>;
  abstract findOneById(id: Nanoid): Promise<any>;

  abstract create(user: JwtPayloadType, dto: any): Promise<any>;

  abstract update(user: JwtPayloadType, id: Nanoid, dto: any): Promise<any>;

  protected isValidSection(user: JwtPayloadType, section: SectionEntity) {
    if (!section) throw new NotFoundException(ErrorCode.E030);

    const {
      instructor: {
        user: { id: course_owner_id },
      },
    } = section.course;

    if (
      course_owner_id !== user.id &&
      !user.permissions.includes(PERMISSION.WRITE_COURSE_ITEM)
    )
      throw new ForbiddenException(ErrorCode.E032);
  }

  protected async getPosition(
    previous_position: string | null,
    section_id: Uuid,
  ): Promise<string> {
    const lecture_positions = await this.lectureRepository.find({
      select: ['position'],
      where: { section_id },
      order: { position: Order.ASC },
    });

    const article_positions = await this.articleRepository.find({
      select: ['position'],
      where: { section_id },
      order: { position: Order.ASC },
    });

    const quiz_positions = await this.quizRepository.find({
      select: ['position'],
      where: { section_id },
      order: { position: Order.ASC },
    });

    const positions = mergeSortedArrays(
      lecture_positions.map(({ position }) => position),
      article_positions.map(({ position }) => position),
      quiz_positions.map(({ position }) => position),
    );

    if (previous_position === null) {
      if (positions.length === 0) return LexoRank.middle().toString();
      return LexoRank.parse(positions[0]).genPrev().toString();
    }

    for (let i = 0; i < positions.length; i++) {
      if (positions[i] === previous_position) {
        if (i === positions.length - 1) {
          return LexoRank.parse(positions[i]).genNext().toString();
        }
        return LexoRank.parse(positions[i])
          .between(LexoRank.parse(positions[i + 1]))
          .toString();
      }
    }
    throw new NotFoundException(ErrorCode.E035);
  }
}
