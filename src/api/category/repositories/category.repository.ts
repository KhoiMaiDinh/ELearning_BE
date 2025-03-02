import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { DataSource, Like, TreeRepository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends TreeRepository<CategoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CategoryEntity, dataSource.createEntityManager());
  }
  async countSlug(slug: string): Promise<number> {
    return await this.count({
      where: {
        slug: Like(`${slug}%`),
      },
    });
  }

  async findOneBySlug(
    slug: string,
    load_entities: string[] = [],
    throw_exception: boolean = true,
    error_message?: string,
  ): Promise<CategoryEntity> {
    const category = await this.findOne({
      where: {
        slug,
      },
      relations: ['translations', 'parent', ...load_entities],
    });
    if (throw_exception && !category)
      throw new ValidationException(ErrorCode.E008, error_message);
    return category;
  }

  async findChildren(
    category: CategoryEntity,
    throw_exception: boolean = true,
  ): Promise<CategoryEntity> {
    const category_with_children = await this.findDescendantsTree(category, {
      relations: ['translations'],
    });

    if (throw_exception && !category_with_children)
      throw new ValidationException(ErrorCode.E008);
    return category;
  }

  async findParent(category: CategoryEntity): Promise<CategoryEntity> {
    return await this.findAncestorsTree(category, {
      relations: ['translations'],
    });
  }
}
