import { UserBasicInfo } from '@/api/user';
import { ClassField } from '@/decorators';
import { RegisterAsInstructorReq } from './register-as-instructor.req.dto';

export class UpdateInstructorDto extends RegisterAsInstructorReq {
  @ClassField(() => UserBasicInfo)
  user: UserBasicInfo;
}
