import { Nanoid, Uuid } from '@/common';
import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import { EnrolledCourseEntity } from '../entities/enrolled-course.entity';

@Injectable()
export class EnrollCourseService {
  constructor(
    @InjectRepository(EnrolledCourseEntity)
    private readonly enrolledCourseRepository: Repository<EnrolledCourseEntity>,
  ) {}

  async enroll(course_id: Uuid, user_id: Uuid): Promise<void> {
    const enroll_course = this.enrolledCourseRepository.create({
      course_id,
      user_id,
    });
    await this.enrolledCourseRepository.save(enroll_course);
  }

  async unenrollCourse(course_id: Uuid, user_id: Nanoid): Promise<void> {
    if (this.isEnrolled(course_id, user_id)) {
      await this.enrolledCourseRepository.softDelete({
        user: { id: user_id },
        course_id,
      });
    } else {
      throw new ValidationException(ErrorCode.E046);
    }
  }
  async findEnrolled(ex_user_id: Nanoid): Promise<CourseEntity[]> {
    const enrolled_courses = await this.enrolledCourseRepository.find({
      where: { user: { id: ex_user_id } },
      relations: ['course', 'user'],
    });

    return (
      enrolled_courses.map((enrolledCourse) => enrolledCourse.course) || []
    );
  }

  async getEnrolledUsers(courseId: string): Promise<string[]> {
    // Logic to get the list of users enrolled in the course
    console.log(`Getting enrolled users for course ${courseId}`);
    // Replace with actual logic to retrieve enrolled users
    return ['user1', 'user2', 'user3'];
  }

  async isEnrolled(course_id: Uuid, user_id: Nanoid): Promise<boolean> {
    // Check if type of user_id is nanoid, query user first

    const has_enrolled = await this.enrolledCourseRepository.exists({
      where: { course_id, user: { id: user_id } },
      relations: ['user'],
    });
    return has_enrolled;
  }
}
