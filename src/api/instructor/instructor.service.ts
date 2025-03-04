import { CategoryRepository } from '@/api/category';
import { UserRepository } from '@/api/user';
import { Nanoid, OffsetPaginatedDto } from '@/common';
import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import { MinioClientService } from '@/libs/minio/minio-client.service';
import { paginate } from '@/utils';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ApproveInstructorDto,
  InstructorRes,
  ListInstructorQuery,
  RegisterAsInstructorReq,
  UpdateInstructorReq,
} from './dto';
import { InstructorEntity } from './entities/instructor.entity';
import { InstructorRepository } from './instructor.repository';

@Injectable()
export class InstructorService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly instructorRepository: InstructorRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly storageService: MinioClientService,
  ) {}
  async create(
    username: Nanoid,
    dto: RegisterAsInstructorReq,
  ): Promise<InstructorRes> {
    const user = await this.userRepository.findOneByPublicId(username, true);

    if (user.instructor_profile) {
      throw new ValidationException(ErrorCode.E011);
    }

    const category = await this.getAndCheckCategory(dto.category_slug);

    const new_instructor_profile = new InstructorEntity({
      user_id: user.user_id,
      biography: dto.biography,
      headline: dto.headline,
      website_url: dto.website_url,
      facebook_url: dto.facebook_url,
      linkedin_url: dto.linkedin_url,
      resume_url: dto.resume_url,
      first_certificate_url: dto.first_certificate_url,
      second_certificate_url: dto.second_certificate_url,
      third_certificate_url: dto.third_certificate_url,
      category,
    });

    await new_instructor_profile.save();
    new_instructor_profile.user = user;
    return new_instructor_profile.toDto(InstructorRes);
  }

  async load(
    dto: ListInstructorQuery,
  ): Promise<OffsetPaginatedDto<InstructorRes>> {
    const { is_approved, specialty } = dto;
    const query = InstructorEntity.createQueryBuilder('instructor')
      .where(is_approved ? 'instructor.is_approved = :is_approved' : '1=1', {
        is_approved: is_approved,
      })
      .leftJoinAndSelect('instructor.category', 'category')
      .andWhere(specialty ? 'category.slug = :slug' : '1=1', {
        slug: specialty,
      })
      .orderBy('instructor.createdAt', 'DESC')
      .leftJoinAndSelect('instructor.user', 'user');

    const [instructors, metaDto] = await paginate<InstructorEntity>(
      query,
      dto,
      {
        skipCount: false,
        takeAll: false,
      },
    );

    return new OffsetPaginatedDto(
      plainToInstance(InstructorRes, instructors),
      metaDto,
    );
  }

  async findOneByUsername(username: string) {
    const instructor = await this.instructorRepository.findOneByUsername(
      username,
      ['category', 'category.translations'],
    );

    return instructor.toDto(InstructorRes);
  }

  async update(username: string, dto: UpdateInstructorReq) {
    const instructor = await this.instructorRepository.findOneByUsername(
      username,
      ['category'],
    );

    if (instructor.category.slug !== dto.category_slug) {
      instructor.category = await this.getAndCheckCategory(dto.category_slug);
    }

    const { user: user_dto, ...rest_dto } = dto;
    Object.assign(instructor, rest_dto);
    Object.assign(instructor.user, { ...instructor.user, ...user_dto });

    await instructor.save();
    await instructor.user.save();
    return instructor.toDto(InstructorRes);
  }

  async approve(
    username: string,
    update_by: Nanoid,
    dto: ApproveInstructorDto,
  ) {
    const instructor =
      await this.instructorRepository.findOneByUsername(username);
    instructor.is_approved = dto.is_approved;
    instructor.disapproval_reason = dto.disapproval_reason;
    instructor.updatedBy = update_by;
    await instructor.save();
    return instructor.toDto(InstructorRes);
  }

  private async getAndCheckCategory(slug: string) {
    const category = await this.categoryRepository.findOneBySlug(slug);
    if (category.parent) throw new ValidationException(ErrorCode.E017);
    return category;
  }
}
