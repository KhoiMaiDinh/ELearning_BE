import { ErrorCode, Language } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

import {
  CategoryRes,
  CreateCategoryReq,
  GetCategoriesQuery,
  GetCategoryQuery,
  UpdateCategoryReq,
} from '@/api/category';
import { InstructorRes } from '@/api/instructor';
import { CategoryTranslationEntity } from './entities/category-translation.entity';
import { CategoryEntity } from './entities/category.entity';
import { CategoryTranslationRepository } from './repositories/category-translation.repository';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryTranslationRepository: CategoryTranslationRepository,
  ) {}

  async findOneInstructors(slug: string): Promise<InstructorRes[]> {
    const category = await this.categoryRepository.findOneBySlug(slug, [
      'instructor',
    ]);
    return plainToInstance(InstructorRes, category.instructors);
  }

  async create(dto: CreateCategoryReq): Promise<CategoryRes> {
    const new_category = new CategoryEntity();

    if (dto.slug) {
      new_category.slug = dto.slug;
    } else {
      const en_name = dto.translations.find((t) => t.language === 'en')?.name;
      new_category.slug = await this.generateUniqueSlug(en_name);
    }

    if (dto.parent_slug) {
      new_category.parent = await this.categoryRepository.findOneBySlug(
        dto.parent_slug,
        [],
        true,
        'Parent category not found',
      );
    }
    await new_category.save();

    const translations = dto.translations.map((t) => {
      return new CategoryTranslationEntity({
        category: new_category,
        language: t.language,
        name: t.name,
        description: t.description,
      });
    });

    await this.categoryTranslationRepository.save(translations);
    new_category.translations = translations;
    return new_category.toDto(CategoryRes);
  }

  async findAll(query: GetCategoriesQuery): Promise<CategoryRes[]> {
    const language = query.language;
    let depth = 0;
    if (query.with_children) depth = 1;

    const categories = await this.categoryRepository.findTrees({
      relations: ['translations'],
      depth,
    });

    if (language)
      categories.forEach((category) =>
        this.filterTranslations(category, language),
      );

    return plainToInstance(CategoryRes, categories);
  }

  async findOne(slug: string, query: GetCategoryQuery): Promise<CategoryRes> {
    let category = await this.categoryRepository.findOneBySlug(slug);
    if (!category) throw new NotFoundException(ErrorCode.E008);
    if (query.with_children)
      category = await this.categoryRepository.findChildren(category, false);
    if (query.with_parent)
      category = await this.categoryRepository.findParent(category);
    if (query.language) this.filterTranslations(category, query.language);
    return category.toDto(CategoryRes);
  }

  async update(slug: string, dto: UpdateCategoryReq): Promise<CategoryRes> {
    const category = await this.categoryRepository.findOneBySlug(slug);

    if (dto.parent_slug && dto.parent_slug !== category.parent?.slug) {
      category.parent = await this.categoryRepository.findOneBySlug(
        dto.parent_slug,
        [],
        true,
        'Parent category not found',
      );
    } else if (!dto.parent_slug) {
      category.parent = null;
    }
    category.slug = dto.slug;

    const old_translations = category.translations;
    const new_translations = old_translations.map((t) => {
      const new_translation = dto.translations.find(
        (nt) => nt.language === t.language,
      );
      t.name = new_translation.name;
      t.description = new_translation.description;
      return t;
    });
    await category.save();
    await this.categoryTranslationRepository.save(new_translations);
    category.translations = new_translations;
    return category.toDto(CategoryRes);
  }

  async remove(slug: string) {
    const category = await this.categoryRepository.findOneBySlug(slug);
    const children_count =
      await this.categoryRepository.countDescendants(category);
    if (children_count > 0) throw new NotFoundException(ErrorCode.E016);
    return await this.categoryRepository.remove(category);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base_slug = slugify(name, { lower: true, strict: true });
    let unique_slug = base_slug;

    const counter = await this.categoryRepository.countSlug(unique_slug);
    if (counter > 0) unique_slug = `${base_slug}-${counter}`;
    return unique_slug;
  }

  filterTranslations(
    category: CategoryEntity,
    language: Language = Language.VI,
  ): void {
    category.translations = category.translations.filter(
      (translation) => translation.language === language,
    );
    if (category.children)
      category.children.forEach((child) => this.filterTranslations(child));
    if (category.parent) this.filterTranslations(category.parent);
  }
}
