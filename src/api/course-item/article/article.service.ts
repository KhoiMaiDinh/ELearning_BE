import { ArticleRes, CreateArticleReq } from '@/api/course-item';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { CourseItemService } from '@/api/course-item/course-item.service';
import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { MediaRepository } from '@/api/media';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ErrorCode, Permission } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleService extends CourseItemService {
  constructor(
    sectionRepository: SectionRepository,
    lectureRepository: Repository<LectureEntity>,
    articleRepository: Repository<ArticleEntity>,
    quizRepository: Repository<QuizEntity>,
    mediaRepository: MediaRepository,
  ) {
    super(
      sectionRepository,
      lectureRepository,
      articleRepository,
      quizRepository,
      mediaRepository,
    );
  }

  async findOne(user: JwtPayloadType, id: Nanoid) {
    if (user.permissions.includes(Permission.READ_COURSE_ITEM))
      return (await this.findOneById(id)).toDto(ArticleRes);
    const article = await this.articleRepository.findOne({
      where: {
        id,
        section: { course: { enrolled_users: { user: { id: user.id } } } },
      },
      relations: {
        section: { course: { enrolled_users: { user: true } } },
      },
    });
    if (!article)
      throw new NotFoundException(
        ErrorCode.E033,
        'Article not found or user has not registered the course',
      );
    return article.toDto(ArticleRes);
  }

  async findOneById(id: Nanoid) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: { section: true },
    });
    if (!article)
      throw new NotFoundException(ErrorCode.E033, 'Article not found');
    return article;
  }

  async create(user: JwtPayloadType, dto: CreateArticleReq) {
    // get section
    const section = await this.sectionRepository.findOne({
      where: { id: dto.section.id },
      relations: { course: { instructor: { user: true } } },
    });
    this.isValidSection(user, section);

    // get position
    const position = await this.getPosition(
      dto.previous_position,
      section.section_id,
    );

    const article = this.articleRepository.create({
      ...dto,
      position,
      section,
    });

    await this.articleRepository.insert(article);
    return article.toDto(ArticleRes);
  }

  async update(user: JwtPayloadType, id: Nanoid, dto: any) {
    const article = await this.findOneById(id);

    const { section, previous_position, ...rest } = dto;

    // get section
    if (section.id != undefined && section?.id !== article.section.id) {
      const section = await this.sectionRepository.findOne({
        where: { id: dto.section.id },
        relations: { course: { instructor: { user: true } } },
      });
      this.isValidSection(user, section);
      article.section = section;
    }

    // get position
    if (previous_position != undefined) {
      const position = await this.getPosition(
        dto.previous_position,
        article.section.section_id,
      );
      article.position = position;
    }

    Object.assign(article, rest);

    await this.articleRepository.update(article.article_id, article);
    return article.toDto(ArticleRes);
  }
}
