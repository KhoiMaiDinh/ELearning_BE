import { CategoryTranslationEntity } from '@/api/category/entities/category-translation.entity';
import { CategoryEntity } from '@/api/category/entities/category.entity';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class CategorySeeder1747058311279 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const categoryRepo = dataSource.getRepository(CategoryEntity);
    const categoryTranslationRepo = dataSource.getRepository(
      CategoryTranslationEntity,
    );

    const categories_path = path.resolve(__dirname, '../data/categories.json');
    const categories = JSON.parse(fs.readFileSync(categories_path, 'utf8'));
    for (const category of categories) {
      let parent: CategoryEntity = null;
      if (category.parent_id) {
        parent = await categoryRepo.findOne({
          where: { category_id: category.parent_id },
        });
      }
      await categoryRepo.save({
        category_id: category.category_id,
        parent: parent,
        slug: category.slug,
      });
    }

    const categories_translation_path = path.resolve(
      __dirname,
      '../data/category_translations_vi.json',
    );
    const categories_translation = JSON.parse(
      fs.readFileSync(categories_translation_path, 'utf8'),
    );

    for (const translation of categories_translation) {
      const category = await categoryRepo.findOne({
        where: { category_id: translation.category_id },
      });

      if (category) {
        await categoryTranslationRepo.save({
          category,
          name: translation.name,
          description: translation.description,
          language: translation.language,
        });
      }
    }
  }
}
