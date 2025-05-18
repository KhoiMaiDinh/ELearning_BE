import { CategoryEntity } from '@/api/category/entities/category.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategorySubscriber } from './category.subscriber';
import { CategoryTranslationEntity } from './entities/category-translation.entity';
import { CategoryTranslationRepository } from './repositories/category-translation.repository';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [
    forwardRef(() =>
      TypeOrmModule.forFeature([CategoryEntity, CategoryTranslationEntity]),
    ),
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    CategoryRepository,
    CategoryTranslationRepository,
    CategorySubscriber,
  ],
  exports: [
    CategoryService,
    CategoryRepository,
    CategoryTranslationRepository,
    CategorySubscriber,
  ],
})
export class CategoryModule {}
