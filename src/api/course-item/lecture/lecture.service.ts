import {
  CreateLectureReq,
  LectureRes,
  UpdateLectureReq,
} from '@/api/course-item';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { CourseItemService } from '@/api/course-item/course-item.service';
import {
  LectureEntity,
  LectureVideoEntity,
  ResourceEntity,
} from '@/api/course-item/lecture/lecture.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { CourseStatus } from '@/api/course/enums/course-status.enum';
import { MediaRepository } from '@/api/media';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { Bucket, ErrorCode, Permission, UploadStatus } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { MinioClientService } from '@/libs/minio';
import { Injectable } from '@nestjs/common';
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
    @InjectRepository(LectureVideoEntity)
    private readonly videoRepository: Repository<LectureVideoEntity>,
    private readonly storageService: MinioClientService,
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
      where: [
        {
          id,
          section: { course: { enrolled_users: { user: { id: user.id } } } },
        },
        { id, is_preview: true },
      ],
      relations: {
        videos: true,
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
        videos: true,
        resources: { resource_file: true },
        section: true,
      },
      order: {
        videos: { version: 'DESC' },
      },
    });
    if (!lecture)
      throw new NotFoundException(ErrorCode.E033, 'Lecture not found');
    lecture.video.video = await this.storageService.getPresignedUrl(
      lecture.video.video,
    );
    return lecture;
  }

  async create(user: JwtPayloadType, dto: CreateLectureReq) {
    const { video: video_dto, ...lecture_dto } = dto;
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
    const media = await this.mediaRepository.findOneById(video_dto.id);
    const video = this.videoRepository.create({
      video: media,
    });

    this.isValidVideo(video);

    const resources = await this.handleResources([], dto.resources);

    const lecture = this.lectureRepository.create({
      ...lecture_dto,
      position,
      videos: [video],
      resources,
      section,
      status: CourseStatus.DRAFT,
    });
    await this.lectureRepository.save(lecture);
    lecture.resources = await this.getResourceAccess(lecture.resources);
    return lecture.toDto(LectureRes);
  }

  private async handleResources(
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

      const resource_file = await this.mediaRepository.findOneById(
        r_dto.resource_file.id,
      );
      if (resource_file.bucket !== Bucket.DOCUMENT)
        throw new NotFoundException(ErrorCode.E034);
      const new_resource = this.resourceRepository.create({
        resource_file,
        name: r_dto.name,
      });
      new_resources.push(new_resource);
    }

    return new_resources;
  }

  async update(user: JwtPayloadType, id: Nanoid, dto: UpdateLectureReq) {
    const lecture = await this.findOneById(id);

    const {
      section: section_dto,
      previous_position,
      video: video_dto,
      resources: resources_dto,
      ...rest
    } = dto;

    // get section
    if (section_dto != undefined && section_dto.id !== lecture.section.id) {
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
    if (video_dto && video_dto?.id !== lecture.videos[0].video.id) {
      const media = await this.mediaRepository.findOneByKey(dto.video.id);
      const video = this.videoRepository.create({
        video: media,
        version: lecture.videos[0].version + 1,
      });
      this.isValidVideo(video);
      lecture.videos = [...lecture.videos, video];
    }

    // get resource
    lecture.resources = await this.handleResources(
      lecture.resources,
      resources_dto,
    );
    Object.assign(lecture, rest);

    await this.lectureRepository.save(lecture);

    lecture.resources = await this.getResourceAccess(lecture.resources);
    return lecture.toDto(LectureRes);
  }

  private isValidVideo(video: LectureVideoEntity) {
    if (
      video.video.bucket !== Bucket.VIDEO &&
      video.video.bucket !== Bucket.TEMP_VIDEO
    )
      throw new ValidationException(ErrorCode.E034);
    if (
      video.video.status !== UploadStatus.UPLOADED &&
      video.video.status !== UploadStatus.VALIDATED
    )
      throw new ValidationException(ErrorCode.E042);
  }

  private async getResourceAccess(resources: ResourceEntity[]) {
    return Promise.all(
      resources?.map(async (r) => {
        r.resource_file = await this.storageService.getPresignedUrl(
          r.resource_file,
        );
        return r;
      }),
    );
  }
}
