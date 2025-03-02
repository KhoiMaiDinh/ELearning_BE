import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  TreeRepository,
  UpdateEvent,
} from 'typeorm';
import { CategoryEntity } from './entities/category.entity';

@EventSubscriber()
export class CategorySubscriber
  implements EntitySubscriberInterface<CategoryEntity>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }
  /**
   * Listen to the Category entity.
   */
  listenTo() {
    return CategoryEntity;
  }

  /**
   * Before inserting a new category, check for self-parenting.
   */
  async beforeInsert(event: InsertEvent<CategoryEntity>) {
    const categoryRepository = event.manager.getTreeRepository(CategoryEntity);
    this.validateSelfParenting(event.entity);
    await this.enforceTwoLevelCategory(event.entity, categoryRepository);
  }

  /**
   * Before updating a category, check for self-parenting.
   */
  async beforeUpdate(event: UpdateEvent<CategoryEntity>) {
    const categoryRepository = event.manager.getTreeRepository(CategoryEntity);
    const category = event.entity as CategoryEntity;
    this.validateSelfParenting(category);
    await this.circularDependency(category, categoryRepository);
    await this.enforceTwoLevelCategory(category, categoryRepository);
  }

  /**
   * Validate that a category does not reference itself as a parent.
   */
  private validateSelfParenting(category: CategoryEntity) {
    if (
      category.parent &&
      category.category_id === category.parent.category_id
    ) {
      throw new ValidationException(ErrorCode.E014);
    }
  }

  private async circularDependency(
    category: CategoryEntity,
    repository: TreeRepository<CategoryEntity>,
  ) {
    const children = await repository.findDescendants(category);
    const has_circular_dependency = children.some(
      (child) => child.category_id === category.parent?.category_id,
    );
    if (has_circular_dependency) {
      throw new ValidationException(ErrorCode.E015);
    }
  }

  private async enforceTwoLevelCategory(
    category: CategoryEntity,
    repository: TreeRepository<CategoryEntity>,
  ): Promise<boolean> {
    if (!category.parent) return; // No parent means it's a root category, so it's valid

    const parent = await repository.findOne({
      where: { category_id: category.parent.category_id },
      relations: ['parent'],
    });

    if (parent?.parent) throw new ValidationException(ErrorCode.E013); // Returns true if the parent already has a parent (i.e., category is at level 3)
  }
}
