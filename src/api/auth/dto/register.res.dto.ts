import { StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RegisterRes {
  @Expose()
  @StringField()
  user_id!: string;
}
