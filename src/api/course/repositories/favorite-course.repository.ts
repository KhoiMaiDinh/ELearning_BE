import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FavoriteCourseEntity } from '../entities/favorite-course.entity';

@Injectable()
export class FavoriteCourseRepository extends Repository<FavoriteCourseEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(FavoriteCourseEntity, dataSource.createEntityManager());
  }
}
