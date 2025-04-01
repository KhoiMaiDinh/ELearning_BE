import { ClassField, DateField, ObjectField, URLField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PostPolicyRes {
  @URLField()
  @Expose()
  postURL: string;

  @ObjectField()
  @Expose()
  formData: Record<string, any>;
}

@Exclude()
export class PresignedUrlRes {
  @ClassField(() => PostPolicyRes)
  @Expose()
  result: PostPolicyRes;

  @DateField()
  @Expose()
  expires_at: Date;

  @Expose()
  id: string;
}
