import { CategoryRepository } from '@/api/category/repositories/category.repository';
import { MediaRepository } from '@/api/media';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, OffsetPaginatedDto } from '@/common';
import {
  DefaultRole,
  ENTITY,
  ErrorCode,
  Language,
  UploadEntityProperty,
  UploadStatus,
} from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { MinioClientService } from '@/libs/minio';
import { paginate } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MediaEntity } from '../media/entities/media.entity';
import { NotificationType } from '../notification/enum/notification-type.enum';
import { NotificationBuilderService } from '../notification/notification-builder.service';
import { NotificationService } from '../notification/notification.service';
import { RoleService } from '../role';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  ApproveInstructorReq,
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
    private readonly userService: UserService,
    private readonly instructorRepository: InstructorRepository,
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
    private readonly categoryRepository: CategoryRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly storageService: MinioClientService,
    private readonly roleService: RoleService,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
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
    this.validateResume(resume);

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
    this.isValidCertificates(new_certificates);
    await this.certificateRepository.save(new_certificates);

    await this.sendRegistrationNotification(user);
    await this.sendApprovalRequestNotification(user);

    new_instructor_profile.user = user;
    new_instructor_profile.certificates = new_certificates;
    return new_instructor_profile.toDto(InstructorRes);
  }

  private async sendRegistrationNotification(user: UserEntity) {
    const notification = await this.notificationService.save(
      user.user_id,
      NotificationType.INSTRUCTOR_REGISTERED,
      {
        user_id: user.id,
        username: user.username,
      },
      {
        title: 'Đăng ký trở thành giảng viên thành công',
        body: `Chào mừng ${user.fullName}! Bạn đã đăng ký thành công làm giảng viên. Vui lòng chờ phê duyệt từ quản trị viên.`,
      },
    );

    const built_notification =
      this.notificationBuilder.instructorRegistered(user);

    this.notificationGateway.emitToUser(user.id, {
      ...notification,
      ...built_notification,
    });
  }

  private async sendApprovalRequestNotification(user: UserEntity) {
    const admins = await this.userService.findAdmins();
    const built_notification =
      this.notificationBuilder.instructorApprovalRequest(user);
    for (const admin of admins) {
      const notification = await this.notificationService.save(
        admin.user_id,
        NotificationType.INSTRUCTOR_APPROVAL_REQUEST,
        {
          user_id: user.id,
          username: user.username,
        },
        {
          title: 'Yêu cầu phê duyệt giảng viên',
          body: `Yêu cầu phê duyệt giảng viên từ ${user.fullName}.`,
        },
      );
      this.notificationGateway.emitToUser(admin.id, {
        ...notification,
        ...built_notification,
      });
    }
  }

  private async sendApprovedNotification(user: UserEntity) {
    const notification = await this.notificationService.save(
      user.user_id,
      NotificationType.PROFILE_APPROVED,
      {
        user_id: user.id,
        username: user.username,
      },
      {
        title: 'Phê duyệt giảng viên thành công',
        body: `Chào mừng ${user.fullName}! Bạn đã được phê duyệt làm giảng viên.`,
      },
    );
    const built_notification = this.notificationBuilder.instructorApproved();
    this.notificationGateway.emitToUser(user.id, {
      ...notification,
      ...built_notification,
    });
  }

  private async sendRejectedNotification(user: UserEntity, reason: string) {
    const notification = await this.notificationService.save(
      user.user_id,
      NotificationType.PROFILE_REJECTED,
      {
        user_id: user.id,
        username: user.username,
        reason: reason,
      },
      {
        title: 'Từ chối giảng viên',
        body: `Xin lỗi ${user.fullName}! Bạn đã bị từ chối làm giảng viên.`,
      },
    );
    const built_notification =
      this.notificationBuilder.instructorRejected(reason);
    this.notificationGateway.emitToUser(user.id, {
      ...notification,
      ...built_notification,
    });
  }

  async load(
    dto: ListInstructorQuery,
  ): Promise<OffsetPaginatedDto<InstructorRes>> {
    const { is_approved, specialty, q, approved_at } = dto;
    const query_builder = InstructorEntity.createQueryBuilder('instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .loadRelationCountAndMap('instructor.total_courses', 'instructor.courses')
      .addSelect(this.buildAvgRatingSubQuery(), 'instructor_avg_rating')
      .addSelect(this.buildTotalStudentsSubQuery(), 'instructor_total_students')
      .leftJoinAndSelect('instructor.category', 'category')
      .leftJoinAndSelect('category.translations', 'category_translations')
      .andWhere('category_translations.language = :language', {
        language: Language.VI,
      })
      .orderBy('instructor.createdAt', 'DESC');

    if (is_approved !== undefined)
      query_builder.andWhere('instructor.is_approved = :is_approved', {
        is_approved,
      });

    if (approved_at !== undefined)
      query_builder
        .andWhere('instructor.approved_at IS NOT NULL')
        .orderBy('instructor.approved_at', approved_at);

    if (specialty !== undefined)
      query_builder.andWhere('category.slug = :slug', {
        slug: specialty,
      });

    if (q) {
      query_builder.andWhere(
        "(instructor.headline ILIKE :q OR user.username ILIKE :q OR (user.first_name || ' ' || user.last_name) ILIKE :q)",
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
      .addSelect(this.buildAvgRatingSubQuery(), 'instructor_avg_rating')
      .addSelect(this.buildTotalStudentsSubQuery(), 'instructor_total_students')
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

    if (!instructor) throw new NotFoundException(ErrorCode.E012);

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
      this.validateResume(resume_file);
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
      this.isValidCertificates(instructor.certificates);
      await this.certificateRepository.save(new_certificates);
    }
    Object.assign(instructor, rest_dto);
    Object.assign(instructor.user, { ...instructor.user, ...user_dto });
    delete instructor.user.password;

    if (instructor.is_approved === false) {
      instructor.is_approved = null;
      instructor.disapproval_reason = null;
    }

    await instructor.save();
    await instructor.user.save();
    return instructor.toDto(InstructorRes);
  }

  async approve(
    username: string,
    update_by: Nanoid,
    dto: ApproveInstructorReq,
  ) {
    const instructor = await this.instructorRepository.findOneByUsername(
      username,
      ['user.roles'],
    );
    instructor.is_approved = dto.is_approved;
    if (dto.is_approved) {
      const now = new Date();
      instructor.approved_at = now;
      instructor.disapproval_reason = null;
      await this.roleService.addToUser(instructor.user, DefaultRole.INSTRUCTOR);
    }
    instructor.disapproval_reason = dto.disapproval_reason;
    instructor.updatedBy = update_by;
    await instructor.save();
    if (dto.is_approved) {
      await this.sendApprovedNotification(instructor.user);
    } else {
      await this.sendRejectedNotification(
        instructor.user,
        dto.disapproval_reason,
      );
    }
    return instructor.toDto(InstructorRes);
  }

  private async getAndCheckCategory(slug: string) {
    const category = await this.categoryRepository.findOneBySlug(slug);
    if (category.parent) throw new ValidationException(ErrorCode.E017);
    return category;
  }

  private validateResume(resume: MediaEntity) {
    if (
      resume.status != UploadStatus.VALIDATED &&
      resume.status != UploadStatus.UPLOADED
    )
      throw new ValidationException(ErrorCode.E042);
    if (
      resume.entity != ENTITY.INSTRUCTOR &&
      resume.entity_property != UploadEntityProperty.RESUME
    )
      throw new ValidationException(ErrorCode.E034);
  }

  private isValidCertificates(certificates: CertificateEntity[]) {
    certificates.forEach(({ certificate_file }) => {
      if (
        certificate_file.status != UploadStatus.VALIDATED &&
        certificate_file.status != UploadStatus.UPLOADED
      )
        throw new ValidationException(ErrorCode.E042);
      if (
        certificate_file.entity != ENTITY.CERTIFICATES &&
        certificate_file.entity_property !=
          UploadEntityProperty.CERTIFICATE_FILE
      )
        throw new ValidationException(ErrorCode.E034);
    });
  }

  // In instructor.service.ts or a utility file
  private buildAvgRatingSubQuery(alias = 'instructor') {
    return (sub_query: SelectQueryBuilder<any>) =>
      sub_query
        .select('AVG(enrolled.rating)', 'avg_rating')
        .from('course', 'course')
        .leftJoin(
          'enrolled-course',
          'enrolled',
          'enrolled.course_id = course.course_id',
        )
        .where(`course.instructor_id = ${alias}.instructor_id`)
        .andWhere('enrolled.rating IS NOT NULL');
  }

  private buildTotalStudentsSubQuery(alias = 'instructor') {
    return (sub_query: SelectQueryBuilder<any>) =>
      sub_query
        .select('COUNT(DISTINCT enrolled.user_id)', 'total_students')
        .from('course', 'course')
        .leftJoin(
          'enrolled-course',
          'enrolled',
          'enrolled.course_id = course.course_id',
        )
        .where(`course.instructor_id = ${alias}.instructor_id`);
  }
}
