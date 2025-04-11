import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, Uuid } from '@/common';
import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseRes } from '../dto';
import { EnrolledCourseEntity } from '../entities/enrolled-course.entity';

@Injectable()
export class EnrollCourseService {
  constructor(
    @InjectRepository(EnrolledCourseEntity)
    private readonly enrolledCourseRepository: Repository<EnrolledCourseEntity>,
    private readonly userRepository: UserRepository,
  ) {}

  async enrollCourse(course_id: Uuid, user_id: Uuid): Promise<void> {
    const enrollCourse = this.enrolledCourseRepository.create({
      course_id,
      user_id,
    });
    await this.enrolledCourseRepository.save(enrollCourse);
  }

  async unenrollCourse(course_id: Uuid, user_id: Uuid): Promise<void> {
    if (this.isEnrolled(course_id, user_id)) {
      await this.enrolledCourseRepository.softDelete({ user_id, course_id });
    } else {
      throw new ValidationException(ErrorCode.E046);
    }
  }
  async getEnrolledCourses(ex_user_id: Nanoid): Promise<CourseRes[]> {
    const user = await this.userRepository.findOne({
      where: { id: ex_user_id },
    });
    if (!user) throw new NotFoundException(ErrorCode.E002);

    const enrolledCourses = await this.enrolledCourseRepository.find({
      where: { user_id: user.user_id },
      relations: ['course'],
    });

    return (
      enrolledCourses.map((enrolledCourse) =>
        enrolledCourse.course.toDto(CourseRes),
      ) || []
    );
  }
  async getEnrolledUsers(courseId: string): Promise<string[]> {
    // Logic to get the list of users enrolled in the course
    console.log(`Getting enrolled users for course ${courseId}`);
    // Replace with actual logic to retrieve enrolled users
    return ['user1', 'user2', 'user3'];
  }

  async isEnrolled(course_id: Uuid, user_id: Uuid): Promise<boolean> {
    const has_enrolled = await this.enrolledCourseRepository.exists({
      where: { course_id, user_id },
    });
    return has_enrolled;
  }
}
