import { Language } from '@/constants';
import { ClassField, EnumField, NumberField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryTranslationRes {
  @Expose()
  @EnumField(() => Language)
  language: string;

  @Expose()
  @StringField()
  name: string;

  @Expose()
  @StringField()
  description?: string;
}

@Exclude()
export class CategoryRes {
  @Expose()
  @ClassField(() => CategoryTranslationRes, { each: true })
  translations: CategoryTranslationRes[];

  @Expose()
  @StringField()
  slug: string;

  @Expose()
  @ClassField(() => CategoryRes)
  parent?: CategoryRes | undefined;

  @Expose()
  @ClassField(() => CategoryRes, { each: true })
  children?: CategoryRes[];

  @Expose()
  @NumberField({ int: true })
  course_count: number;
}
