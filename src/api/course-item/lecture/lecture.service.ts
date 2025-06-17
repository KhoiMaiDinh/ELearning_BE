import { Nanoid } from '@/common';
import { Bucket, ErrorCode, PERMISSION, UploadStatus } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { MinioClientService } from '@/libs/minio';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateLectureReq,
  LectureRes,
  UpdateLectureReq,
} from '@/api/course-item';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { CourseItemService } from '@/api/course-item/course-item.service';
import { ResourceReq } from '@/api/course-item/dto/resource.req.dto';
import { LectureEntity } from '@/api/course-item/lecture/entities/lecture.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';

import { CourseStatus } from '@/api/course/enums/course-status.enum';
import { LectureCommentService } from '@/api/lecture-comment/lecture-comment.service';
import { MediaRepository } from '@/api/media';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { LectureSeriesEntity } from './entities/lecture-series.entity';
import { ResourceEntity } from './entities/resource.entity';
import { LectureSeriesRepository } from './repositories/lecture-series.repository';

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
    // @InjectRepository(LectureVideoEntity)
    // private readonly videoRepository: Repository<LectureVideoEntity>,
    private readonly storageService: MinioClientService,
    private readonly commentService: LectureCommentService,
    private readonly lectureSeriesRepo: LectureSeriesRepository,
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
    if (user.permissions.includes(PERMISSION.READ_COURSE_ITEM))
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
        series: true,
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
        series: { resources: { resource_file: true } },
        section: true,
      },
      order: {
        series: { version: 'DESC' },
      },
    });
    if (!lecture)
      throw new NotFoundException(ErrorCode.E033, 'Lecture not found');
    lecture.latestPublishedSeries.video =
      await this.storageService.getPresignedUrl(
        lecture.latestPublishedSeries.video,
      );
    return lecture;
  }

  async create(user: JwtPayloadType, dto: CreateLectureReq) {
    const { video: video_dto, title, description, is_preview } = dto;
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
    const video = await this.mediaRepository.findOneById(video_dto.id);

    this.isValidVideo(video);

    const resources = await this.handleResources([], dto.resources);

    const lecture = this.lectureRepository.create({
      position,
      section,
    });
    await this.lectureRepository.save(lecture);

    const lecture_series = this.lectureSeriesRepo.create({
      title,
      description,
      is_preview,
      duration_in_seconds: video_dto.duration_in_seconds,
      video,
      version: 1,
      resources,
      status: CourseStatus.DRAFT,
      lecture,
    });
    await this.lectureSeriesRepo.save(lecture_series);
    lecture_series.resources = await this.getResourceAccess(lecture.resources);
    lecture.series = [lecture_series];
    return lecture.toDto(LectureRes);
  }

  private async handleResources(
    resources: ResourceEntity[] = [],
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
        resource.name = r_dto.name;
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
    const { video: video_dto, title, description, is_preview } = dto;

    let targetSeries = lecture.series.find(
      (s) => s.status === CourseStatus.DRAFT,
    );

    if (!targetSeries) {
      targetSeries = this.lectureSeriesRepo.create({
        title,
        description,
        is_preview,
        duration_in_seconds: video_dto.duration_in_seconds,
        lecture_id: lecture.lecture_id,
        version: lecture.series.length + 1,
      });
    } else {
      targetSeries.title = title;
      targetSeries.description = description;
      targetSeries.is_preview = is_preview;
      targetSeries.duration_in_seconds = video_dto.duration_in_seconds;
    }

    if (dto.video?.id && dto.video?.id !== targetSeries.video?.id) {
      const video = await this.mediaRepository.findOneById(dto.video.id);
      this.isValidVideo(video);
      targetSeries.video = video;
    }

    targetSeries.resources = await this.handleResources(
      targetSeries.resources,
      dto.resources,
    );
    console.log(targetSeries.resources);

    await this.lectureSeriesRepo.save(targetSeries);

    // Optional: mark review comments as resolved
    // await this.commentService.markAllAsSolved(lecture.lecture_id);

    // Post-processing: signed URLs for resources
    targetSeries.resources = await this.getResourceAccess(
      targetSeries.resources,
    );

    lecture.series = lecture.series.find(
      (s) => s.lecture_series_id === targetSeries.lecture_series_id,
    )
      ? lecture.series.map((s) =>
          s.lecture_series_id === targetSeries.lecture_series_id
            ? targetSeries
            : s,
        )
      : [targetSeries, ...lecture.series];

    return lecture.toDto(LectureRes);
  }

  async removeDraftVersion(
    user: JwtPayloadType,
    lecture_id: Nanoid,
  ): Promise<void> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lecture_id },
      relations: { series: true },
    });

    if (!lecture) {
      throw new NotFoundException(ErrorCode.E033, 'Lecture not found');
    }

    const draft_series = lecture.series?.find(
      (s) => s.status === CourseStatus.DRAFT,
    );
    if (!draft_series) {
      throw new NotFoundException(
        ErrorCode.E033,
        'No draft version found for this lecture',
      );
    }
    console.log(draft_series);

    if (draft_series.resources?.length) {
      await this.lectureSeriesRepo
        .createQueryBuilder()
        .relation(LectureSeriesEntity, 'resources')
        .of(draft_series.lecture_series_id)
        .remove(draft_series.resources);
    }

    await this.lectureSeriesRepo.delete({
      lecture_series_id: draft_series.lecture_series_id,
    });

    const remaining_series = lecture.series?.filter(
      (s) => s.lecture_series_id !== draft_series.lecture_series_id,
    );
    const has_published = remaining_series?.some(
      (s) => s.status === CourseStatus.PUBLISHED,
    );

    if (!has_published) {
      await this.lectureRepository.delete({
        id: lecture_id,
      });
    }
  }

  async hide(user: JwtPayloadType, id: Nanoid): Promise<void> {
    const result = await this.lectureRepository.update(
      { id },
      { is_hidden: true },
    );
    if (result.affected === 0) {
      throw new NotFoundException(ErrorCode.E033, 'Lecture not found');
    }
  }

  async unhide(user: JwtPayloadType, id: Nanoid): Promise<void> {
    const result = await this.lectureRepository.update(
      { id },
      { is_hidden: false },
    );
    if (result.affected === 0) {
      throw new NotFoundException(ErrorCode.E033, 'Lecture not found');
    }
  }

  private isValidVideo(video: MediaEntity) {
    if (video.bucket !== Bucket.VIDEO && video.bucket !== Bucket.TEMP_VIDEO)
      throw new ValidationException(ErrorCode.E034);

    if (
      video.status !== UploadStatus.UPLOADED &&
      video.status !== UploadStatus.VALIDATED
    )
      throw new ValidationException(ErrorCode.E042);
  }

  private async getResourceAccess(resources: ResourceEntity[]) {
    if (!resources?.length) return [];
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
