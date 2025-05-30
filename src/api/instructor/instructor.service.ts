import { CategoryRepository } from '@/api/category/repositories/category.repository';
import { MediaRepository } from '@/api/media';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, OffsetPaginatedDto } from '@/common';
import {
  Entity,
  ErrorCode,
  Language,
  UploadEntityProperty,
  UploadStatus,
} from '@/constants';
import { ValidationException } from '@/exceptions';
import { MinioClientService } from '@/libs/minio';
import { paginate } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { MediaEntity } from '../media/entities/media.entity';
import {
  ApproveInstructorDto,
  InstructorRes,
  ListInstructorQuery,
  RegisterAsInstructorReq,
  UpdateInstructorReq,
} from './dto';
import { CertificateEntity } from './entities/certificate.entity';
import { InstructorEntity } from './entities/instructor.entity';
import { InstructorRepository } from './instructor.repository';

@Injectable()
export class InstructorService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly instructorRepository: InstructorRepository,
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
    private readonly categoryRepository: CategoryRepository,
    private readonly mediaRepository: MediaRepository,
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

    const category = await this.getAndCheckCategory(dto.category.slug);

    const resume = await this.mediaRepository.findOneById(dto.resume.id);
    this.checkValidResume(resume);

    const new_instructor_profile = new InstructorEntity({
      user_id: user.user_id,
      biography: dto.biography,
      headline: dto.headline,
      website_url: dto.website_url,
      facebook_url: dto.facebook_url,
      linkedin_url: dto.linkedin_url,
      resume,
      category,
    });

    await new_instructor_profile.save();

    const certificate_files = await this.mediaRepository.findManyByIds(
      dto.certificates.map((certificate) => certificate.id),
    );
    const new_certificates = certificate_files.map((file) => {
      return new CertificateEntity({
        certificate_file: file,
        instructor: new_instructor_profile,
      });
    });
    this.checkValidCertificates(new_certificates);
    await this.certificateRepository.save(new_certificates);

    new_instructor_profile.user = user;
    new_instructor_profile.certificates = new_certificates;
    return new_instructor_profile.toDto(InstructorRes);
  }

  async load(
    dto: ListInstructorQuery,
  ): Promise<OffsetPaginatedDto<InstructorRes>> {
    const { is_approved, specialty, q } = dto;
    const query_builder = InstructorEntity.createQueryBuilder('instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .loadRelationCountAndMap('instructor.total_courses', 'instructor.courses')
      .orderBy('instructor.createdAt', 'DESC');

    if (is_approved !== undefined)
      query_builder.andWhere('instructor.is_approved = :is_approved', {
        is_approved,
      });

    if (specialty !== undefined)
      query_builder
        .leftJoinAndSelect('instructor.category', 'category')
        .andWhere('category.slug = :slug', {
          slug: specialty,
        })
        .leftJoinAndSelect('category.translations', 'category_translations')
        .andWhere('category_translations.language = :language', {
          language: Language.VI,
        });

    // Add search by q (e.g., search by headline or user name)
    if (q) {
      query_builder.andWhere(
        '(instructor.headline ILIKE :q OR user.username ILIKE :q OR user.full_name ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    const [instructors, metaDto] = await paginate<InstructorEntity>(
      query_builder,
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
    const instructor = await this.instructorRepository
      .createQueryBuilder('instructor')
      .leftJoinAndSelect('instructor.category', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'category_translations',
        'category_translations.language = :language',
        {
          language: Language.VI,
        },
      )
      .loadRelationCountAndMap('instructor.total_courses', 'instructor.courses')
      .leftJoinAndSelect('instructor.user', 'user')
      .where('user.username = :username', { username })
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .leftJoinAndSelect('instructor.resume', 'resume')
      .leftJoinAndSelect('instructor.certificates', 'certificates')
      .leftJoinAndSelect('certificates.certificate_file', 'certificate_file')
      .getOne();

    if (instructor?.resume)
      await this.storageService.getPresignedUrl(instructor.resume);

    if (instructor?.certificates) {
      for (const certificate of instructor.certificates) {
        await this.storageService.getPresignedUrl(certificate.certificate_file);
      }
    }

    return instructor.toDto(InstructorRes);
  }

  async update(username: string, dto: UpdateInstructorReq) {
    const instructor = await this.instructorRepository.findOneByUsername(
      username,
      ['category', 'certificates'],
    );

    if (instructor.category.slug !== dto.category.slug) {
      instructor.category = await this.getAndCheckCategory(dto.category.slug);
    }

    const {
      user: user_dto,
      resume: resume_dto,
      certificates: certificates_dto,
      ...rest_dto
    } = dto;
    if (resume_dto && resume_dto.id !== instructor.resume.id) {
      const resume_file = await this.mediaRepository.findOneById(resume_dto.id);
      this.checkValidResume(resume_file);
      instructor.resume = resume_file;
    }

    if (certificates_dto) {
      const certificate_files = await this.mediaRepository.findManyByIds(
        certificates_dto.map((certificate) => certificate.id),
      );

      const existing_certificates_ids = instructor.certificates.map(
        (certificate) => certificate.certificate_file.id,
      );
      const new_certificates = certificate_files
        .filter((file) => !existing_certificates_ids.includes(file.id))
        .map((file) => {
          return new CertificateEntity({
            certificate_file: file,
            instructor: instructor,
          });
        });

      const certificates_to_remove = instructor.certificates.filter(
        (certificate) =>
          !certificates_dto.some(
            (c) => c.id === certificate.certificate_file.id,
          ),
      );
      await this.certificateRepository.softRemove(certificates_to_remove);

      instructor.certificates = [
        ...instructor.certificates.filter((c) =>
          certificates_dto.some((c2) => c2.id === c.certificate_file.id),
        ),
        ...new_certificates,
      ];
      this.checkValidCertificates(instructor.certificates);
      await this.certificateRepository.save(new_certificates);
    }
    Object.assign(instructor, rest_dto);
    Object.assign(instructor.user, { ...instructor.user, ...user_dto });
    delete instructor.user.password;

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

  private checkValidResume(resume: MediaEntity) {
    if (
      resume.status != UploadStatus.VALIDATED &&
      resume.status != UploadStatus.UPLOADED
    )
      throw new ValidationException(ErrorCode.E042);
    if (
      resume.entity != Entity.INSTRUCTOR &&
      resume.entity_property != UploadEntityProperty.RESUME
    )
      throw new ValidationException(ErrorCode.E034);
  }

  private checkValidCertificates(certificates: CertificateEntity[]) {
    certificates.forEach(({ certificate_file }) => {
      if (
        certificate_file.status != UploadStatus.VALIDATED &&
        certificate_file.status != UploadStatus.UPLOADED
      )
        throw new ValidationException(ErrorCode.E042);
      if (
        certificate_file.entity != Entity.CERTIFICATES &&
        certificate_file.entity_property !=
          UploadEntityProperty.CERTIFICATE_FILE
      )
        throw new ValidationException(ErrorCode.E034);
    });
  }
}
