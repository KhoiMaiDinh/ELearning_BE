import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CategoryTranslationEntity } from '../entities/category-translation.entity';

@Injectable()
export class CategoryTranslationRepository extends Repository<CategoryTranslationEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CategoryTranslationEntity, dataSource.createEntityManager());
  }
}
