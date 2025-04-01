import {
  CreateLectureReq,
  LectureRes,
  UpdateLectureReq,
} from '@/api/course-item';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { CourseItemService } from '@/api/course-item/course-item.service';
import {
  LectureEntity,
  ResourceEntity,
} from '@/api/course-item/lecture/lecture.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { MediaRepository } from '@/api/media';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { Bucket, ErrorCode, Permission } from '@/constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceReq } from '../dto/resource.req.dto';

@Injectable()
export class LectureService extends CourseItemService {
  constructor(
    sectionRepository: SectionRepository,
    lectureRepository: Repository<LectureEntity>,
    articleRepository: Repository<ArticleEntity>,
    quizRepository: Repository<QuizEntity>,
    mediaRepository: MediaRepository,
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
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
        resources: true,
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
      relations: {
        video: true,
        resources: { resource_file: true },
        section: true,
      },
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
    const video = await this.mediaRepository.findOneById(dto.video.id);
    if (video.bucket !== Bucket.VIDEO && video.bucket !== Bucket.TEMP_VIDEO)
      throw new NotFoundException(ErrorCode.E034);

    const resources = await this.handleResources([], dto.resources);

    const lecture = this.lectureRepository.create({
      ...dto,
      position,
      video,
      resources,
      section,
    });
    await this.lectureRepository.save(lecture);
    return lecture.toDto(LectureRes);
  }

  async handleResources(
    resources: ResourceEntity[],
    resources_dto: ResourceReq[],
  ) {
    if (resources_dto == undefined) return resources;
    const resources_map = new Map(
      resources.map((r) => [r.resource_file.id, r]),
    );
    const new_resources: ResourceEntity[] = [];
    for (const r_dto of resources_dto) {
      const resource = resources_map.get(r_dto.resource_file.id);
      if (resource) {
        new_resources.push(resource);
        continue;
      }

      const resource_file = await this.mediaRepository.findOneByKey(
        r_dto.resource_file.id,
      );
      if (resource_file.bucket !== Bucket.DOCUMENT)
        throw new NotFoundException(ErrorCode.E034);
      const new_resource = this.resourceRepository.create({
        resource_file,
      });
      new_resources.push(new_resource);
    }

    return new_resources;
  }

  async update(user: JwtPayloadType, id: Nanoid, dto: UpdateLectureReq) {
    const lecture = await this.findOneById(id);

    const { section, previous_position, video, resources, ...rest } = dto;

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
    if (video?.id !== undefined && video?.id !== lecture.video.id) {
      const video = await this.mediaRepository.findOneByKey(dto.video.id);
      if (video.bucket !== Bucket.VIDEO)
        throw new NotFoundException(ErrorCode.E034);
      lecture.video = video;
    }

    // get resource
    lecture.resources = await this.handleResources(
      lecture.resources,
      resources,
    );
    Object.assign(lecture, rest);

    await this.lectureRepository.save(lecture);
    return lecture.toDto(LectureRes);
  }
}
