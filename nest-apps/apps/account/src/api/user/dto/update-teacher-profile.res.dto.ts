import { Expose, Type } from 'class-transformer';
import { UserResDto } from './user.res.dto';
import { DataResponseDto } from '@app/common';
import { TeacherProfileRes } from './teacher-profile.res.dto';

class UpdateTeacherProfileData extends UserResDto {
  @Expose()
  @Type(() => TeacherProfileRes)
  teacher_profile: TeacherProfileRes;
}

export class UpdateTeacherProfileRes extends DataResponseDto<UpdateTeacherProfileData> {
  @Type(() => UpdateTeacherProfileData)
  data: UpdateTeacherProfileData;
}
