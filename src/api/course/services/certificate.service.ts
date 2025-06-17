import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { EnrolledCourseEntity } from '../entities/enrolled-course.entity';
import { EnrolledCourseRepository } from '../repositories/enrolled-course.repository';

@Injectable()
export class CertificateService {
  constructor(private readonly enrolledRepo: EnrolledCourseRepository) {}

  async getAllUserCertificates(
    user_id: Nanoid,
  ): Promise<EnrolledCourseEntity[]> {
    const certificates = await this.enrolledRepo.find({
      where: {
        user: { id: user_id },
        is_completed: true,
        certificate_code: Not(IsNull()),
      },
      relations: { course: { instructor: { user: true } }, user: true },
      order: { completed_at: 'DESC' },
    });

    return certificates;
  }

  async getByCertificateCode(code: string): Promise<EnrolledCourseEntity> {
    const enrollment = await this.enrolledRepo.findOne({
      where: { certificate_code: code },
      relations: { course: { instructor: { user: true } }, user: true },
    });

    if (!enrollment) {
      throw new NotFoundException(ErrorCode.E084);
    }

    return enrollment;
  }
}
