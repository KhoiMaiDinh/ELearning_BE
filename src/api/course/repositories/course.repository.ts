import { CourseEntity } from '@/api/course/entities/course.entity';
import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';

@Injectable()
export class CourseRepository extends Repository<CourseEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CourseEntity, dataSource.createEntityManager());
  }

  async findOneByPublicIdOrSlug(
    id: Nanoid | string,
    load_entities: FindOptionsRelations<CourseEntity>,
    throw_exception: boolean = true,
  ): Promise<CourseEntity> {
    const course = await this.findOne({
      where: [{ id: id as Nanoid }, { slug: id }],
      relations: load_entities,
    });

    if (!course && throw_exception) {
      throw new NotFoundException(ErrorCode.E025);
    }
    return course;
  }
}
