import {
  CreateLectureReq,
  LectureRes,
  UpdateLectureReq,
} from '@/api/course-item';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { CourseItemService } from '@/api/course-item/course-item.service';
import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { MediaRepository } from '@/api/media';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { Bucket, ErrorCode, Permission } from '@/constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class LectureService extends CourseItemService {
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
      return (await this.findOneById(id)).toDto(LectureRes);
    const lecture = await this.lectureRepository.findOne({
      where: {
        id,
        section: { course: { enrolled_users: { user: { id: user.id } } } },
      },
      relations: {
        video: true,
        resource: true,
        section: { course: { enrolled_users: { user: true } } },
      },
    });
    if (!lecture)
      throw new NotFoundException(
        ErrorCode.E033,
        'Lecture not found or user has not registered the course',
      );
    return lecture.toDto(LectureRes);
  }

  async findOneById(id: Nanoid) {
    const lecture = await this.lectureRepository.findOne({
      where: { id },
      relations: { video: true, resource: true, section: true },
    });
    if (!lecture)
      throw new NotFoundException(ErrorCode.E033, 'Lecture not found');
    return lecture;
  }

  async create(user: JwtPayloadType, dto: CreateLectureReq) {
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

    // get medias
    const video = await this.mediaRepository.findOneByKey(dto.video.key);
    if (video.bucket !== Bucket.VIDEO)
      throw new NotFoundException(ErrorCode.E034);

    const resource = await this.mediaRepository.findOneByKey(dto.resource.key);
    if (resource.bucket !== Bucket.DOCUMENT || !resource.key.endsWith('.var'))
      throw new NotFoundException(ErrorCode.E034);

    const lecture = this.lectureRepository.create({
      ...dto,
      position,
      video,
      resource,
    });
    await this.lectureRepository.insert(lecture);
    return lecture.toDto(LectureRes);
  }

  async update(user: JwtPayloadType, id: Nanoid, dto: UpdateLectureReq) {
    const lecture = await this.findOneById(id);

    const { section, previous_position, video, resource, ...rest } = dto;

    // get section
    if (section?.id != undefined && section?.id !== lecture.section.id) {
      const section = await this.sectionRepository.findOne({
        where: { id: dto.section.id },
        relations: { course: { instructor: { user: true } } },
      });
      this.isValidSection(user, section);
      lecture.section = section;
    }

    // get position
    if (previous_position != undefined) {
      const position = await this.getPosition(
        dto.previous_position,
        lecture.section.section_id,
      );
      lecture.position = position;
    }

    // get medias
    if (video?.key !== undefined && video?.key !== lecture.video.key) {
      const video = await this.mediaRepository.findOneByKey(dto.video.key);
      if (video.bucket !== Bucket.VIDEO)
        throw new NotFoundException(ErrorCode.E034);
      lecture.video = video;
    }

    // get resource
    if (resource?.key !== undefined && resource.key !== lecture?.resource.key) {
      const resource = await this.mediaRepository.findOneByKey(
        dto.resource.key,
      );
      if (resource.bucket !== Bucket.DOCUMENT || !resource.key.endsWith('.var'))
        throw new NotFoundException(ErrorCode.E034);
      lecture.resource = resource;
    }
    Object.assign(lecture, rest);

    await this.lectureRepository.save(lecture);
    return lecture.toDto(LectureRes);
  }
}
