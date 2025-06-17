import { UserEntity } from '@/api/user/entities/user.entity';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, Uuid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { CourseEntity } from '../entities/course.entity';
import { FavoriteCourseEntity } from '../entities/favorite-course.entity';
import { CourseRepository } from '../repositories/course.repository';
import { FavoriteCourseRepository } from '../repositories/favorite-course.repository';

@Injectable()
export class FavoriteCourseService {
  constructor(
    private readonly favoriteCourseRepo: FavoriteCourseRepository,
    private readonly userRepo: UserRepository,
    private readonly courseRepo: CourseRepository,
  ) {}

  async add(user_id: Nanoid, course_id: Nanoid): Promise<FavoriteCourseEntity> {
    const user = await this.userRepo.findOneByPublicId(user_id);
    const course = await this.courseRepo.findOneBy({ id: course_id });
    if (!course) throw new NotFoundException(ErrorCode.E025);

    // Prevent duplicate favorites
    const existing = await this.favoriteCourseRepo.findOneBy({
      user_id: user.user_id,
      course_id: course.course_id,
    });
    if (existing) throw new ValidationException(ErrorCode.E078);

    const favorite = this.favoriteCourseRepo.create({
      user,
      course,
    });
    return this.favoriteCourseRepo.save(favorite);
  }

  async remove(user_id: Nanoid, course_id: Nanoid): Promise<void> {
    const favorite = await this.favoriteCourseRepo.findOne({
      where: {
        course: { id: course_id },
        user: { id: user_id },
      },
      relations: { course: true, user: true },
    });
    if (!favorite) throw new NotFoundException(ErrorCode.E079);
    await this.favoriteCourseRepo.softRemove(favorite);
  }

  async list(user_id: Nanoid): Promise<CourseEntity[]> {
    const favorites = await this.favoriteCourseRepo.find({
      where: { user: { id: user_id } },
      relations: {
        user: true,
        course: { instructor: { user: true }, thumbnail: true },
      },
      order: { createdAt: 'DESC' },
    });
    return favorites.map((favorite) => favorite.course);
  }

  async hasFavorited(user_id: Uuid, course_id: Uuid): Promise<boolean> {
    const favorite = await this.favoriteCourseRepo.findOne({
      where: { user_id, course_id },
    });
    return !!favorite;
  }

  async findUsers(course_id: Uuid): Promise<UserEntity[]> {
    const favorites = await this.favoriteCourseRepo.find({
      where: { course_id },
      relations: { user: true },
    });
    const users = favorites.map((favorite) => favorite.user);
    return users;
  }
}
