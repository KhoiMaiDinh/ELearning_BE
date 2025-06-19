import { WarningRes } from '@/api/ban/dto';
import { CategoryRes } from '@/api/category';
import { CouponRes } from '@/api/coupon/dto';
import { CourseLevel, CourseStatus } from '@/api/course';
import { InstructorRes } from '@/api/instructor';
import { MediaRes } from '@/api/media';
import { SectionRes } from '@/api/section';
import { Nanoid, WrapperType } from '@/common';
import { Language } from '@/constants';
import {
  BooleanField,
  ClassField,
  DateField,
  EnumField,
  NumberField,
  StringField,
} from '@/decorators';
import { StorageVideo } from '@/libs/minio';
import { Exclude, Expose } from 'class-transformer';
import { CourseUnbanResponseDto } from './unban-request.res.dto';

@Exclude()
export class CourseRes {
  @Expose()
  @StringField()
  id: Nanoid;

  @Expose()
  @StringField()
  title: string;
  @Expose()
  @StringField()
  slug: string;

  @Expose()
  @ClassField(() => CategoryRes)
  category: CategoryRes;

  @Expose()
  @ClassField(() => InstructorRes)
  instructor: InstructorRes;

  @Expose()
  @StringField({ nullable: true })
  subtitle: string | null;

  @Expose()
  @ClassField(() => MediaRes)
  thumbnail: MediaRes | null;

  @Expose()
  @StringField({ nullable: true })
  preview: StorageVideo | null;

  @Expose()
  @StringField({ nullable: true })
  description: string;

  @Expose()
  @DateField()
  published_at: Date;

  @Expose()
  @EnumField(() => Language)
  language: Language;

  @Expose()
  level: CourseLevel | null;

  @Expose()
  @StringField({ nullable: true, each: true })
  requirements: string[] | null;

  @Expose()
  @StringField({ nullable: true, each: true })
  outcomes: string[] | null;

  @Expose()
  @NumberField({ nullable: true })
  price: number | null;

  @Expose()
  status: CourseStatus;

  @Expose()
  @ClassField(() => SectionRes, { each: true })
  sections: WrapperType<SectionRes[]>;

  @Expose()
  @NumberField({ nullable: true })
  avg_rating: number | null;

  @Expose()
  @NumberField({ nullable: true })
  total_enrolled: number;

  @Expose()
  @NumberField({ nullable: true })
  total_revenue: number;

  @Expose()
  @BooleanField()
  is_favorite: boolean;

  @Expose()
  @ClassField(() => CouponRes, { each: true })
  coupons: WrapperType<CouponRes[]> | null;

  @Expose()
  @DateField()
  createdAt: Date;

  @Expose()
  @DateField()
  updatedAt: Date;

  @Expose()
  @DateField()
  deletedAt: Date;

  @Expose()
  @ClassField(() => CourseUnbanResponseDto, { each: true })
  unban_requests: WrapperType<CourseUnbanResponseDto[]>;

  @Expose()
  @ClassField(() => WarningRes, { each: true })
  warnings: WrapperType<WarningRes[]>;
}
