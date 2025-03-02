import { Language } from '@/constants';
import {
  ClassField,
  EnsureLanguages,
  EnumField,
  StringField,
  StringFieldOptional,
} from '@/decorators';
import { IsArray, ValidateNested } from 'class-validator';

class CategoryTranslationReq {
  @EnumField(() => Language)
  language: Language;

  @StringField()
  name: string;

  @StringField()
  description?: string;
}

export class CreateCategoryReq {
  @IsArray()
  @ValidateNested({ each: true })
  @EnsureLanguages(['en', 'vi'])
  @ClassField(() => CategoryTranslationReq, { each: true })
  translations: CategoryTranslationReq[];

  @StringFieldOptional()
  parent_slug?: string; // If it's a subcategory

  @StringFieldOptional()
  slug?: string; // generated if null
}
