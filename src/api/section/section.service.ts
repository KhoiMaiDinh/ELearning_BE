import { CourseRepository, CourseStatus } from '@/api/course';
import { CreateSectionReq, SectionRes, UpdateSectionReq } from '@/api/section';
import { SectionEntity } from '@/api/section/entities/section.entity';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid, Uuid } from '@/common';
import { ErrorCode, PERMISSION } from '@/constants';
import { ForbiddenException } from '@/exceptions';
import { LexoRank } from '@dalet-oss/lexorank';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MoreThan } from 'typeorm';

@Injectable()
export class SectionService {
  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async create(
    user: JwtPayloadType,
    dto: CreateSectionReq,
  ): Promise<SectionRes> {
    const course = await this.courseRepository.findOne({
      where: { id: dto.course.id },
      relations: { instructor: { user: true } },
    });

    const {
      course_id,
      instructor: {
        user: { id: course_owner_id },
      },
    } = course;

    if (!course_id) throw new NotFoundException(ErrorCode.E025);
    if (
      course_owner_id !== user.id &&
      !user.permissions.includes(PERMISSION.WRITE_SECTION)
    )
      throw new ForbiddenException(ErrorCode.E029);

    const position = await this.getPosition(
      dto.previous_section_id,
      course_id,
      null,
    );
    const createdBy = user.id;

    const new_section = new SectionEntity({
      title: dto.title,
      position,
      course_id,
      status: CourseStatus.DRAFT,
      description: dto.description,
      createdBy,
    });

    await this.sectionRepository.insert(new_section);

    return new_section.toDto(SectionRes);
  }

  async update(
    user: JwtPayloadType,
    section_id: Nanoid,
    dto: UpdateSectionReq,
  ): Promise<SectionRes> {
    const section = await this.sectionRepository.findOne({
      where: { id: section_id },
      relations: {
        course: { instructor: { user: true } },
      },
    });

    if (!section) throw new NotFoundException(ErrorCode.E030);

    const {
      course: {
        course_id,
        instructor: {
          user: { id: owner_id },
        },
      },
    } = section;
    if (
      owner_id !== user.id &&
      !user.permissions.includes(PERMISSION.WRITE_SECTION)
    )
      throw new ForbiddenException(ErrorCode.E029);

    if (dto.previous_section_id != undefined) {
      const position = await this.getPosition(
        dto.previous_section_id,
        course_id,
        section_id,
      );
      section.position = position;
    }
    const updateBy = user.id;

    const update_section = Object.assign(section, dto, {
      updateBy,
    });
    await update_section.save();
    return update_section.toDto(SectionRes);
  }

  async delete(user: JwtPayloadType, section_id: Nanoid): Promise<void> {}

  private async getPosition(
    previous_section_id: Nanoid,
    course_id: Uuid,
    section_id: Nanoid | null,
  ): Promise<string> {
    if (!previous_section_id) {
      const first_section = await this.sectionRepository.findOne({
        where: {
          course_id,
        },
        order: {
          position: 'ASC',
        },
      });

      if (!first_section) return LexoRank.middle().toString();
      if (section_id && first_section.id === section_id)
        return first_section.position;
      return LexoRank.parse(first_section.position).genPrev().toString();
    } else {
      const previous_section = await this.sectionRepository.findOne({
        where: { id: previous_section_id },
      });

      if (!previous_section) throw new NotFoundException(ErrorCode.E030);

      const next_section = await this.sectionRepository.findOne({
        where: { position: MoreThan(previous_section.position) },
        order: { position: 'ASC' },
      });
      const prev_position = LexoRank.parse(previous_section.position);
      if (!next_section) return prev_position.genNext().toString();

      const next_position = LexoRank.parse(next_section.position);

      const new_position = prev_position.between(next_position);
      return new_position.toString();
    }
  }
}
