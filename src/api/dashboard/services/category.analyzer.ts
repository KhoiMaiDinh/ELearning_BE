import { CategoryRepository } from '@/api/category';
import { CourseRepository } from '@/api/course';
import { ErrorCode, Language } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { CategoryStatRes } from '../dto';

@Injectable()
export class CategoryAnalyzer {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly courseRepo: CourseRepository,
  ) {}

  async getCourseCount(slug?: string): Promise<CategoryStatRes[]> {
    if (!slug) {
      return await this.getRootCategoriesWithCounts();
    } else {
      return await this.getChildCategoriesWithCounts(slug);
    }
  }

  private async getRootCategoriesWithCounts(): Promise<CategoryStatRes[]> {
    const root_categories = await this.categoryRepo.findRoots({
      relations: ['children', 'translations'],
    });

    const all_child_ids = root_categories
      .flatMap((cat) => cat.children)
      .map((child) => child.category_id);

    if (all_child_ids.length === 0) {
      return root_categories.map((cat) => {
        const vi_translation =
          cat.translations.find((t) => t.language === Language.VI) ||
          cat.translations[0];
        return {
          name: vi_translation.name,
          slug: cat.slug,
          course_count: 0,
        };
      });
    }

    const course_counts = await this.courseRepo
      .createQueryBuilder('course')
      .select('course.category_id', 'category_id')
      .addSelect('COUNT(*)', 'count')
      .where('course.published_at IS NOT NULL')
      .andWhere('course.category_id IN (:...ids)', { ids: all_child_ids })
      .groupBy('course.category_id')
      .getRawMany();

    const count_map = new Map<string, number>();
    for (const { category_id, count } of course_counts) {
      count_map.set(category_id, parseInt(count, 10));
    }

    return root_categories.map((cat) => {
      const total = cat.children.reduce((sum, child) => {
        return sum + (count_map.get(child.category_id) || 0);
      }, 0);

      const vi_translation =
        cat.translations.find((t) => t.language === Language.VI) ||
        cat.translations[0];

      return {
        name: vi_translation.name,
        slug: cat.slug,
        course_count: total,
      };
    });
  }

  private async getChildCategoriesWithCounts(
    parent_slug: string,
  ): Promise<CategoryStatRes[]> {
    const parent = await this.categoryRepo.findOne({
      where: { slug: parent_slug },
      relations: ['children', 'children.translations'],
    });

    if (!parent) throw new NotFoundException(ErrorCode.E008);

    if (parent.children.length === 0) return [];

    const child_ids = parent.children.map((c) => c.category_id);

    const courseCounts = await this.courseRepo
      .createQueryBuilder('course')
      .select('course.category_id', 'category_id')
      .addSelect('COUNT(*)', 'count')
      .where('course.published_at IS NOT NULL')
      .andWhere('course.category_id IN (:...ids)', { ids: child_ids })
      .groupBy('course.category_id')
      .getRawMany();

    const countMap = new Map<string, number>();
    for (const { categoryId, count } of courseCounts) {
      countMap.set(categoryId, parseInt(count, 10));
    }

    return parent.children.map((cat) => {
      const vi_translation =
        cat.translations.find((t) => t.language === Language.VI) ||
        cat.translations[0];
      return {
        name: vi_translation.name,
        slug: cat.slug,
        course_count: countMap.get(cat.category_id) || 0,
      };
    });
  }
}
