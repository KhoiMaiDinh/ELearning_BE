import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../category';
import { InstructorRepository } from '../instructor';
import { CourseRepository } from './course.repository';
import { CreateCourseReq } from './dto/create-course.dto.req';
import { UpdateCourseReq } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly instructorRepository: InstructorRepository,
  ) {}
  async create(dto: CreateCourseReq) {
    const { title, category_slug, username } = dto;
    const category = await this.categoryRepository.findOneBySlug(category_slug);
    const instructor =
      await this.instructorRepository.findOneByUsername(username);

    const course = await this.courseRepository.createCourse({
      title,
      category,
      instructor,
    });

    return course;
  }

  findAll() {
    return `This action returns all course`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, dto: UpdateCourseReq) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
